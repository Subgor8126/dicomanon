'use client';

import React from 'react';
import Button from '@mui/material/Button';
import { useAuth } from 'react-oidc-context';

export default function SignInButton({ variant }: { variant?: 'header' | 'primary' | 'secondary' | 'card' | 'cta' }) {

  const auth  = useAuth();

  const handleSignIn = async () => {
    try {
      await auth.signinRedirect();
    } catch (error) {
      console.error('Error during federated sign-in:', error);
    }
  };

  const getButtonProps = () => {
    switch (variant) {
      case 'header':
      case 'secondary':
        return {
          variant: 'outlined' as const,
          color: 'primary' as const,
          sx: {
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(102, 0, 51, 0.1)',
            },
          },
        };
      case 'card':
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
          fullWidth: true,
          sx: {
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(102, 0, 51, 0.8)',
            },
          },
        };
      default: // primary
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
          sx: {
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(102, 0, 51, 0.8)',
            },
          },
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Button
      {...buttonProps}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 500,
        px: 3,
        py: 1.5,
        ...buttonProps.sx,
      }}
      onClick={handleSignIn}
    >
      Sign In
    </Button>
  );
}