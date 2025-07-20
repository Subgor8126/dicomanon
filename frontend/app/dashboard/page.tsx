'use client';

import { useAuth } from 'react-oidc-context';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

interface UserData {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  credits: number;
}

export default function DashboardPage() {
  const auth = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.isAuthenticated || !auth.user?.access_token) {
          throw new Error('User is not authenticated.');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.user?.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error fetching user data: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        console.error('[DashboardPage] Error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.isAuthenticated, auth.user]);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Loading your dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="warning">No user data found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: 'black',
          color: 'white',
          border: '2px solid #660033',
        }}
      >
        <Typography variant="h4" gutterBottom color="#660033">
          Welcome, {userData.display_name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Email:</strong> {userData.email}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Role:</strong> {userData.role}
        </Typography>
        <Typography variant="body1">
          <strong>Credits:</strong> {userData.credits}
        </Typography>
      </Paper>
    </Container>
  );
}