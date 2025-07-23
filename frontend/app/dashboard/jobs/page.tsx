"use client";
import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Stack, TableSortLabel, TablePagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Skeleton, TextField, MenuItem } from '@mui/material';
import { useDashboard } from '../../../components/dashboard/DashboardContext';
import InfoIcon from '@mui/icons-material/Info';

const statusColors: Record<string, 'primary' | 'info' | 'success' | 'warning' | 'error'> = {
  PENDING: 'info',
  RUNNING: 'primary',
  COMPLETED: 'success',
  FAILED: 'error',
};

export default function JobsPage() {
  const { jobs, loading } = useDashboard();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [orderBy, setOrderBy] = useState<'created_at' | 'status'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSort = (property: 'created_at' | 'status') => {
    setOrderBy(property);
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };

  const filteredJobs = jobs
    .filter(j => (filterStatus ? j.status === filterStatus : true))
    .filter(j => (filterDate ? j.created_at.startsWith(filterDate) : true))
    .sort((a, b) => {
      if (orderBy === 'created_at') {
        return order === 'asc'
          ? a.created_at.localeCompare(b.created_at)
          : b.created_at.localeCompare(a.created_at);
      } else {
        return order === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });

  const paginatedJobs = filteredJobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Jobs</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="RUNNING">Running</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
          </TextField>
          <TextField
            label="Date"
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </Stack>
      <TableContainer component={Paper} sx={{ background: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status <TableSortLabel active={orderBy==='status'} direction={order} onClick={() => handleSort('status')} /></TableCell>
              <TableCell>Date <TableSortLabel active={orderBy==='created_at'} direction={order} onClick={() => handleSort('created_at')} /></TableCell>
              <TableCell>Artifacts</TableCell>
              <TableCell>Audit Log</TableCell>
              <TableCell>Time Taken</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedJobs.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No jobs found.</TableCell></TableRow>
            ) : (
              paginatedJobs.map(job => (
                <TableRow hover key={job.id} onClick={() => setSelectedJob(job)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Chip label={job.status} color={statusColors[job.status] || 'default'} />
                  </TableCell>
                  <TableCell>{job.created_at.slice(0, 19).replace('T', ' ')}</TableCell>
                  <TableCell>{job.s3_cleaned_result_key ? <a href={job.s3_cleaned_result_key} target="_blank" rel="noopener noreferrer">Artifact</a> : '-'}</TableCell>
                  <TableCell>{job.s3_audit_log_key ? <a href={job.s3_audit_log_key} target="_blank" rel="noopener noreferrer">Audit Log</a> : '-'}</TableCell>
                  <TableCell>{job.started_at && job.completed_at ? `${((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime())/1000).toFixed(1)}s` : '-'}</TableCell>
                  <TableCell><IconButton><InfoIcon /></IconButton></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredJobs.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]}
      />
      <Dialog open={!!selectedJob} onClose={() => setSelectedJob(null)} maxWidth="md" fullWidth>
        <DialogTitle>Job Details</DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Stack spacing={2} mt={1}>
              <Typography><b>Status:</b> {selectedJob.status}</Typography>
              <Typography><b>Created:</b> {selectedJob.created_at}</Typography>
              <Typography><b>Started:</b> {selectedJob.started_at || '-'}</Typography>
              <Typography><b>Completed:</b> {selectedJob.completed_at || '-'}</Typography>
              <Typography><b>Connection:</b> {selectedJob.connection}</Typography>
              <Typography><b>OCR Requested:</b> {selectedJob.ocr_requested ? 'Yes' : 'No'}</Typography>
              <Typography><b>Tag Removal Requested:</b> {selectedJob.tag_removal_requested ? 'Yes' : 'No'}</Typography>
              <Typography><b>Artifact:</b> {selectedJob.s3_cleaned_result_key ? <a href={selectedJob.s3_cleaned_result_key} target="_blank" rel="noopener noreferrer">Download</a> : '-'}</Typography>
              <Typography><b>Audit Log:</b> {selectedJob.s3_audit_log_key ? <a href={selectedJob.s3_audit_log_key} target="_blank" rel="noopener noreferrer">Download</a> : '-'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedJob(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}