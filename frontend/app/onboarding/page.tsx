'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';

import { useRouter } from 'next/navigation';

const ROLES = [
  "RADIOLOGIST",
  "RESEARCHER",
  "STUDENT",
  "TECHNICIAN",
  "OTHER"
];

function OnboardingForm() {
  const auth = useAuth();
  const { user, signinRedirect } = auth;
  // const { getAccessTokenSilently, loginWithRedirect, user } = useAuth0();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('OTHER');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill from API if user already exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = user?.access_token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.display_name || '');
          setRole(data.role || 'OTHER');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load existing user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user?.access_token]);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const token = user?.access_token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: displayName,
          email: user?.profile?.email || '',
          user_id: user?.profile?.sub || '',
          role: role,
          onboarding_complete: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save user details.');
      }

      await signinRedirect()

    } catch (err) {
      console.error(err);
      setError('An error occurred while saving your details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'grey.300' }}>Loading user data...</Typography>
      </Box>
    );
  }

return (
  <Box
    sx={{
      bgcolor: 'black',
      color: 'white',
      minHeight: '100vh',
      py: 8,
    }}
  >
    <Container maxWidth="sm">
      <Box
        sx={{
          border: '2px solid #660033',
          borderRadius: 3,
          p: 4,
          bgcolor: 'transparent',
          backdropFilter: 'blur(0px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="#660033">
            Complete Your Profile
          </Typography>
          <Typography 
            variant="body1"
            fontWeight="bold"
            sx={{ mt: 1, color: 'grey.300', backgroundColor: 'rgb(102, 0, 51)', p: 2, borderRadius: 2 }}
        >
            Please verify your email in your inbox before clicking Submit below.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label="Display Name"
            variant="outlined"
            fullWidth
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            InputLabelProps={{ style: { color: 'grey.400' } }}
            InputProps={{
              style: {
                color: 'white',
                backgroundColor: 'black',
                borderRadius: 4,
                borderColor: '#660033',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#660033',
                },
                '&:hover fieldset': {
                  borderColor: '#a64d79',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#a64d79',
                },
              },
            }}
          />

          <TextField
            label="Role"
            variant="outlined"
            select
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            InputLabelProps={{ style: { color: 'grey.400' } }}
            InputProps={{
              style: {
                color: 'white',
                backgroundColor: 'black',
                borderRadius: 4,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#660033',
                },
                '&:hover fieldset': {
                  borderColor: '#a64d79',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#a64d79',
                },
              },
            }}
          >
            {ROLES.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              mt: 2,
              backgroundColor: '#660033',
              color: '#fff',
              '&:hover': {
                background:
                  'linear-gradient(90deg, #660033 0%, #a64d79 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              py: 1.5,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit & Login'}
          </Button>
        </Box>
      </Box>
    </Container>
  </Box>
);
}

export default function OnboardingPage() {
  return <OnboardingForm />;
}