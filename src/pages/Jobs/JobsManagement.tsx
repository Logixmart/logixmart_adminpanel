import { useState } from 'react';
import type { JobPost } from '../../api/jobPost';
import JobList from './JobList';
import CreateJob from './CreateJob';

type JobsView = 'list' | 'create' | 'edit';

/**
 * Jobs tab container — mirrors BlogsManagement navigation style
 * (list ↔ create/edit) without relying on react-router.
 */
export default function JobsManagement() {
  const [view, setView] = useState<JobsView>('list');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const goToList = (shouldRefresh = false) => {
    setView('list');
    setEditingJobId(null);
    if (shouldRefresh) {
      setRefreshKey((k) => k + 1);
    }
  };

  if (view === 'create') {
    return (
      <CreateJob
        mode="create"
        onSuccess={() => goToList(true)}
        onCancel={() => goToList(false)}
      />
    );
  }

  if (view === 'edit' && editingJobId) {
    return (
      <CreateJob
        mode="edit"
        jobId={editingJobId}
        onSuccess={() => goToList(true)}
        onCancel={() => goToList(false)}
      />
    );
  }

  return (
    <JobList
      refreshKey={refreshKey}
      onCreate={() => {
        setEditingJobId(null);
        setView('create');
      }}
      onEdit={(job: JobPost) => {
        setEditingJobId(job.id);
        setView('edit');
      }}
    />
  );
}
