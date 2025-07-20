# auth_service.py
# This module provides utility functions for verifying Cognito JWT tokens
# and extracting user information from incoming HTTP requests in a Django app.

import jwt
import requests
from django.conf import settings
from django.http import JsonResponse

# Cognito configuration from settings.py
COGNITO_REGION = settings.COGNITO_REGION
USER_POOL_ID = settings.COGNITO_USER_POOL_ID
APP_CLIENT_ID = settings.COGNITO_APP_CLIENT_ID

JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}"
AUDIENCE = APP_CLIENT_ID

_cached_jwks = None


def get_cognito_public_keys():
    """
    Fetch and cache Cognito JWKS public keys.
    """
    global _cached_jwks
    if _cached_jwks:
        return _cached_jwks

    try:
        response = requests.get(JWKS_URL, timeout=5)
        response.raise_for_status()
        _cached_jwks = response.json().get("keys", [])
        return _cached_jwks
    except requests.RequestException as e:
        print(f"❗ Failed to fetch Cognito JWKS: {e}")
        return None


def cognito_token_verification(token):
    """
    Verify JWT access token issued by AWS Cognito and extract the user ID (sub).
    """
    try:
        keys = get_cognito_public_keys()
        if not keys:
            print("❗ No JWKS keys available.")
            return None

        header = jwt.get_unverified_header(token)
        key = next((k for k in keys if k["kid"] == header.get("kid")), None)
        if not key:
            print("❗ Matching JWK not found for kid.")
            return None

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=ISSUER
        )

        if payload.get("client_id") != APP_CLIENT_ID:
            print("❗ Invalid client_id")
            return None

        user_id = payload.get("sub")
        print(f"✅ Verified Cognito User ID: {user_id}")
        return user_id

    except jwt.ExpiredSignatureError:
        print("❗ Token expired")
    except jwt.InvalidAudienceError:
        print("❗ Invalid audience")
    except jwt.InvalidIssuerError:
        print("❗ Invalid issuer")
    except Exception as e:
        print(f"❗ Token verification error: {e}")

    return None


def get_user_id_from_request_token(request):
    """
    Extract and verify the Authorization header in an incoming request.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, JsonResponse({"error": "Missing or malformed Authorization header"}, status=401)

    try:
        token = auth_header.split(" ")[1]
    except IndexError:
        return None, JsonResponse({"error": "Malformed Authorization header"}, status=401)

    user_id = cognito_token_verification(token)
    if not user_id:
        return None, JsonResponse({"error": "Invalid or expired token"}, status=401)

    return user_id, None