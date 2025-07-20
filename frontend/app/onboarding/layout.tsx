'use client';

import React from 'react';
import { useAuth } from 'react-oidc-context';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress
} from '@mui/material';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {

  const auth = useAuth();
  const { isLoading, isAuthenticated, signinRedirect } = auth;

  // Show loading spinner while Auth0 is initializing
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Onboarding...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h6">Please sign in to access onboarding.</Typography>
        <Button variant="contained" color="primary" onClick={() => signinRedirect()}>
          Sign In
        </Button>
      </Container>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}