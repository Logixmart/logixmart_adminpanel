import { useState } from 'react';
import JobApplicationList from './JobApplicationList';
import JobApplicationDetails from './JobApplicationDetails';

type ApplicationsView = 'list' | 'details';

export default function JobApplicationsManagement() {
  const [view, setView] = useState<ApplicationsView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const goToList = (shouldRefresh = false) => {
    setView('list');
    setSelectedId(null);
    if (shouldRefresh) {
      setRefreshKey((k) => k + 1);
    }
  };

  if (view === 'details' && selectedId) {
    return (
      <JobApplicationDetails
        applicationId={selectedId}
        onBack={(shouldRefresh) => goToList(shouldRefresh)}
      />
    );
  }

  return (
    <JobApplicationList
      refreshKey={refreshKey}
      onView={(id) => {
        setSelectedId(id);
        setView('details');
      }}
    />
  );
}
