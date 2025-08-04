"use client";
import React from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Stack, Skeleton, Grid } from '@mui/material';
import { useDashboard } from '../../components/dashboard/DashboardContext';
import WorkIcon from '@mui/icons-material/Work';
import ListAltIcon from '@mui/icons-material/ListAlt';

export default function DashboardHome() {
  const { user, jobs, loading } = useDashboard();

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome, {loading ? <Skeleton width={120} /> : user?.display_name || 'User'}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Chip label={user?.role || 'Role'} color="primary" variant="outlined" />
                {user?.onboarding_complete ? (
                  <Chip label="Onboarding Complete" color="success" />
                ) : (
                  <Chip label="Onboarding Incomplete" color="warning" />
                )}
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="secondary" startIcon={<WorkIcon />} href="/dashboard/run-job">
                  Run De-ID
                </Button>
                <Button variant="contained" color="info" startIcon={<ListAltIcon />} href="/dashboard/jobs">
                  View Jobs
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Jobs Run</Typography>
              {loading ? (
                <Skeleton width={60} height={40} />
              ) : (
                <Typography variant="h3" color="primary.main">{jobs?.length ?? 0}</Typography>
              )}
              {/* Placeholder for chart or more stats */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}