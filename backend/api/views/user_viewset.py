from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import User
from api.serializers import UserSerializer
from api.permission import TokenRequired

class UserViewSet(viewsets.ModelViewSet):
    """
    Handles user creation, self-retrieval, and self-update securely.
    """
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [TokenRequired]

    def list(self, request, *args, **kwargs):
        """
        Disable listing all users.
        """
        return Response(
            {"detail": "GET /users/ is disabled. Use /users/me/."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def retrieve(self, request, *args, **kwargs):
        """
        Disable retrieving other users by ID.
        """
        return Response(
            {"detail": "GET /users/{id}/ is disabled. Use /users/me/."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Secure self-data retrieval.
        """
        user_id = request.token_user_id
        try:
            user_obj = User.objects.get(user_id=user_id)
            serializer = self.get_serializer(user_obj)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        """
        Secure self-update.
        """
        user_id = request.token_user_id
        try:
            user_obj = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(user_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        """
        Idempotent create: get_or_create user based on token user_id.
        """
        token_user_id = request.token_user_id
        data = request.data.copy()

        user, created = User.objects.get_or_create(
            user_id=token_user_id,
            defaults=data
        )

        serializer = self.get_serializer(user)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )