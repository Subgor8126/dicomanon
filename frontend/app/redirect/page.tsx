'use client';

import { useAuth } from 'react-oidc-context';
import React, { useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

function RedirectLogic() {
  const auth = useAuth();
  const router = useRouter();

  const { isLoading, isAuthenticated, user } = auth;

  useEffect(() => {
    console.log('[RedirectLogic] useEffect triggered', { isLoading, isAuthenticated, user });

    if (isLoading) {
      console.log('[RedirectLogic] Auth is still loading...');
      return;
    }

    if (!isAuthenticated) {
      console.log('[RedirectLogic] Not authenticated, do nothing.');
      return;
    }

    const checkOnboarding = async () => {
      try {
        const accessToken = user?.access_token;

        if (!accessToken) {
          console.error('[RedirectLogic] No access token available!');
          return;
        }

        console.log('[RedirectLogic] Access token acquired:', '[REDACTED]');

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/me/`;
        console.log('[RedirectLogic] Fetching user data from:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log('[RedirectLogic] Backend response status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log('[RedirectLogic] User data received:', userData);

          if (userData.onboarding_complete) {
            console.log('[RedirectLogic] Onboarding complete. Redirecting to /dashboard');
            router.replace('/dashboard');
          } else {
            console.log('[RedirectLogic] Onboarding incomplete. Redirecting to /onboarding');
            router.replace('/onboarding');
          }

        } else if (response.status === 404) {
          console.log('[RedirectLogic] User not found (404). Redirecting to /onboarding');
          router.replace('/onboarding');
        } else {
          console.error('[RedirectLogic] Unexpected response from backend', response.status);
          // Optionally show error state
        }

      } catch (err) {
        console.error('[RedirectLogic] Error checking onboarding', err);
        // Optionally show error state
      }
    };

    checkOnboarding();
  }, [isLoading, isAuthenticated, user, router]);

  console.log('[RedirectLogic] Rendered loading UI');
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <CircularProgress color="primary" />
      <Typography variant="h6" sx={{ mt: 2 }}>Redirecting...</Typography>
    </Box>
  );
}

export default function RedirectPage() {
  console.log('[RedirectPage] Rendered');
  return (
    <RedirectLogic />
  );
}