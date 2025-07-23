"use client";
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Skeleton, Alert, CircularProgress } from '@mui/material';
import { useDashboard } from '../../../components/dashboard/DashboardContext';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudIcon from '@mui/icons-material/Cloud';

export default function ConnectionsPage() {
  const { connections, loading, refreshAll } = useDashboard();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bucket_name: '',
    aws_role_arn: '',
    region: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpen = () => {
    setForm({ name: '', bucket_name: '', aws_role_arn: '', region: '' });
    setFormError(null);
    setActionError(null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setFormError(null);
    setActionError(null);
  };

  const validateForm = () => {
    if (!form.name || !form.bucket_name || !form.aws_role_arn || !form.region) {
      setFormError('All fields are required.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user?.access_token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to add connection');
      }
      handleClose();
      await refreshAll();
    } catch (err: any) {
      setActionError(err.message || 'Failed to add connection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    setDeleteId(id);
    setActionError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.user?.access_token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to delete connection');
      }
      await refreshAll();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete connection');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Connections</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Connection
        </Button>
      </Stack>
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))
        ) : connections.length === 0 ? (
          <Grid item xs={12}><Typography>No connections found.</Typography></Grid>
        ) : (
          connections.map((conn) => (
            <Grid item xs={12} md={6} key={conn.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <CloudIcon color="primary" />
                    <Typography variant="h6">{conn.name}</Typography>
                    <Chip label={conn.region || 'Region'} size="small" color="secondary" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">Bucket: {conn.bucket_name}</Typography>
                  <Typography variant="body2" color="text.secondary">Role ARN: {conn.aws_role_arn}</Typography>
                  <Stack direction="row" justifyContent="flex-end" mt={2}>
                    <IconButton color="error" onClick={() => handleDelete(conn.id)} disabled={deleteId === conn.id}>
                      {deleteId === conn.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Connection</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Connection Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth required error={!!formError && !form.name} />
            <TextField label="Bucket Name" value={form.bucket_name} onChange={e => setForm(f => ({ ...f, bucket_name: e.target.value }))} fullWidth required error={!!formError && !form.bucket_name} />
            <TextField label="Role ARN" value={form.aws_role_arn} onChange={e => setForm(f => ({ ...f, aws_role_arn: e.target.value }))} fullWidth required error={!!formError && !form.aws_role_arn} />
            <TextField label="Region" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} fullWidth required error={!!formError && !form.region} />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" color="primary" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 