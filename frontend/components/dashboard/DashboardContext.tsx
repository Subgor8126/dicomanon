'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';

// Example types
interface User {
  user_id: string;
  email: string;
  display_name?: string;
  credits: number;
  role: string;
}

interface Connection {
  id: string;
  name: string;
  bucket_name: string;
  aws_role_arn: string;
  region?: string;
}

interface Job {
  id: string;
  status: string;
  credits_charged: number;
  created_at: string;
  updated_at: string;
  started_at?: string; // Optional, may not be set if job hasn't started
  completed_at?: string; // Optional, may not be set if job hasn't completed
  connection: string;
  ocr_requested: boolean;
  tag_removal_requested: boolean;
  s3_cleaned_result_key: string;
  s3_audit_log_key: string;
  source_artifact_id: string;
  destination_artifact_id: string;
  // Add other fields you need
}

interface DashboardContextType {
  user: User | null;
  connections: Connection[];
  jobs: Job[];
  // The array notation simply means that there can be multiple connections and jobs
  // Because we only have one user in this context, we use User | null
  loading: boolean;
  error: string | null;
  refreshAll: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!auth || !auth.user || !auth.user.access_token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = auth.user.access_token;

      // Parallel fetching
      const [userRes, connectionsRes, jobsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!userRes.ok) throw new Error('Failed to fetch user');
      if (!connectionsRes.ok) throw new Error('Failed to fetch connections');
      if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

      const userData = await userRes.json();
      const connectionsData = await connectionsRes.json();
      const jobsData = await jobsRes.json();

      setUser(userData);
      setConnections(connectionsData);
      setJobs(jobsData);
    } catch (err: any) {
      console.error('DashboardContext error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth.user]);

  const value: DashboardContextType = {
    user,
    connections,
    jobs,
    loading,
    error,
    refreshAll: fetchData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}