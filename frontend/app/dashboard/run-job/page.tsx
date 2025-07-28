"use client";
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, TextField, MenuItem, Checkbox, FormControlLabel, Alert, CircularProgress } from '@mui/material';
import { useDashboard } from '../../../components/dashboard/DashboardContext';
import WorkIcon from '@mui/icons-material/Work';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from 'react-oidc-context';

export default function RunJobPage() {
  const { connections, refreshAll } = useDashboard();
  const auth = useAuth();
  const [form, setForm] = useState({
    connection: '',
    userBucket: '',
    uploadPrefix: '',
    resultPrefix: '',
    ocrRequested: false,
    ocrRenderBoxes: false,
    tagRemovalRequested: false,
    aiInferenceRequested: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (!form.connection || !form.userBucket || !form.uploadPrefix || !form.resultPrefix) {
      setError('Please fill in all required fields.');
      return;
    }
    console.log('Submitting job with form data:', form);
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const selectedConnection = connections.find(conn => conn.id === form.connection);
      if (!selectedConnection) throw new Error('Selected connection not found.');
      const jobId = uuidv4();
      const payload = {
        jobId,
        user_bucket: form.userBucket,
        upload_prefix: form.uploadPrefix,
        result_prefix: form.resultPrefix,
        user_role_arn: selectedConnection.aws_role_arn,
        ocr_requested: form.ocrRequested,
        ocr_render_boxes: form.ocrRenderBoxes,
        tag_removal_requested: form.tagRemovalRequested,
        ai_inference_requested: form.aiInferenceRequested,
        connection: form.connection,
        sagemaker_endpoint: null // backend will fill this
      };
      console.log('Payload to send:', payload);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.user?.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to launch job');
      }
      setSuccess('Job launched successfully!');
      setForm({ connection: '', userBucket: '', uploadPrefix: '', resultPrefix: '', ocrRequested: false, ocrRenderBoxes: false, tagRemovalRequested: false, aiInferenceRequested: false });
      await refreshAll();
    } catch (err: any) {
      setError(err.message || 'Failed to launch job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto">
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2}>Run De-Identification Job</Typography>
          <Stack spacing={3}>
            <TextField
              select
              label="Select Connection"
              value={form.connection}
              onChange={e => handleChange('connection', e.target.value)}
              fullWidth
              required
              helperText={connections.length === 0 ? 'No connections found. Add a connection first.' : ''}
              disabled={connections.length === 0}
            >
              {connections.map(conn => (
                <MenuItem key={conn.id} value={conn.id}> {conn.name} ({conn.region})</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Source Bucket (userBucket)"
              value={form.userBucket}
              onChange={e => handleChange('userBucket', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Upload Prefix"
              value={form.uploadPrefix}
              onChange={e => handleChange('uploadPrefix', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Result Prefix"
              value={form.resultPrefix}
              onChange={e => handleChange('resultPrefix', e.target.value)}
              fullWidth
              required
            />
            <FormControlLabel
              control={<Checkbox checked={form.ocrRequested} onChange={e => handleChange('ocrRequested', e.target.checked)} />}
              label="Perform OCR cleanup?"
            />
            <FormControlLabel
              control={<Checkbox checked={form.ocrRenderBoxes} onChange={e => handleChange('ocrRenderBoxes', e.target.checked)} />}
              label="Mask OCR boxes?"
            />
            <FormControlLabel
              control={<Checkbox checked={form.tagRemovalRequested} onChange={e => handleChange('tagRemovalRequested', e.target.checked)} />}
              label="Remove visual tags?"
            />
            <FormControlLabel
              control={<Checkbox checked={form.aiInferenceRequested} onChange={e => handleChange('aiInferenceRequested', e.target.checked)} />}
              label="Run AI inference?"
            />
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Button
              variant="contained"
              color="primary"
              startIcon={<WorkIcon />}
              onClick={handleSubmit}
              disabled={loading || connections.length === 0}
            >
              {loading ? <CircularProgress size={20} /> : 'Run De-ID Job'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
} 