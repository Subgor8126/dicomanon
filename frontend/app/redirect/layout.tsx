'use client';

import { useAuth } from 'react-oidc-context';
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface RedirectLayoutProps {
  children: React.ReactNode;
}

export default function RedirectLayout({ children }: RedirectLayoutProps) {
  const auth = useAuth();
  const { isLoading, isAuthenticated, error } = auth;

  // Show loading spinner while Auth0 is initializing
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2 }}>Checking account...</Typography>
      </Box>
    );
  }

  // Show error if authentication failed
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="error">Error: {error.message}</Typography>
      </Box>
    );
  }

  // Show message if unauthenticated
  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6">Not authenticated. Please sign in.</Typography>
      </Box>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}