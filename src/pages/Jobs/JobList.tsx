import { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  Edit3,
  MapPin,
  Trash2,
} from 'lucide-react';
import {
  DeleteConfirmModal,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PageLoading,
  SearchBar,
  SuccessBanner,
} from '../../components/ui';
import {
  deleteJob,
  getJobs,
  type JobPost,
} from '../../api/jobPost';

export interface JobListProps {
  onCreate: () => void;
  onEdit: (job: JobPost) => void;
  refreshKey?: number;
}

export default function JobList({ onCreate, onEdit, refreshKey = 0 }: JobListProps) {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadJobs();
  }, [search, refreshKey]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJobs({
        page: 1,
        limit: 50,
        search: search || undefined,
      });
      setJobs(response.data || []);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response
        ?.status;
      const apiMessage = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      setError(
        apiMessage
          ? `${apiMessage}${status ? ` (${status})` : ''}`
          : 'Failed to load job posts. Make sure the backend is running.',
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleOpenDelete = (job: JobPost) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;
    setIsDeleting(true);
    try {
      await deleteJob(selectedJob.id);
      setJobs((prev) => prev.filter((job) => job.id !== selectedJob.id));
      setIsDeleteOpen(false);
      setSelectedJob(null);
      showSuccess('Job post deleted successfully.');
    } catch {
      setError('Failed to delete job post.');
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = jobs.filter((j) => j.isActive).length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <PageHeader
        action={{ label: 'Create Job Post', onClick: onCreate }}
        actionStyle="uppercase"
      />

      {successBanner && <SuccessBanner message={successBanner} variant="compact" />}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
            <Briefcase size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Total Jobs
            </span>
            <span className="text-lg font-bold text-text-primary">{jobs.length}</span>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center text-accent-secondary border border-accent-secondary/20">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Active Listings
            </span>
            <span className="text-lg font-bold text-text-primary">{activeCount}</span>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-info/10 flex items-center justify-center text-accent-info border border-accent-info/20">
            <MapPin size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              With Location
            </span>
            <span className="text-lg font-bold text-text-primary">
              {jobs.filter((j) => j.location).length}
            </span>
          </div>
        </div>
      </div>

      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search jobs by title, company, or skills..."
      />

      {error && (
        <ErrorBanner
          error={error}
          onRetry={loadJobs}
          retryLabel="Retry"
        />
      )}

      {loading ? (
        <PageLoading message="Loading job posts..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title={search ? 'No Results Found' : 'No Job Posts Yet'}
          description={
            search
              ? `No jobs matched "${search}". Try different keywords.`
              : 'Create your first job opening to list it on the careers page.'
          }
          action={
            !search ? { label: 'Add First Job', onClick: onCreate } : undefined
          }
        />
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-brand-border bg-brand-dark/40">
                  {['Title', 'Location', 'Type', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-brand-border/60 hover:bg-brand-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5 max-w-[220px]">
                        <span className="text-[13px] font-semibold text-text-primary truncate">
                          {job.title}
                        </span>
                        {job.skills?.length > 0 && (
                          <span className="text-[10px] text-text-muted truncate">
                            {job.skills.slice(0, 3).join(' · ')}
                            {job.skills.length > 3 ? '…' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary">
                      {job.location || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary">
                      {job.employmentType || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                          job.isActive
                            ? 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20'
                            : 'bg-text-muted/10 text-text-muted border-brand-border'
                        }`}
                      >
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(job)}
                          className="cursor-pointer font-semibold text-[11px] py-1.5 px-2.5 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center gap-1.5 transition-all"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(job)}
                          className="cursor-pointer p-1.5 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
                          title="Delete job"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        isSubmitting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Post"
        confirmLabel="Delete Job"
        description={
          <>
            Are you sure you want to delete{' '}
            <strong className="text-text-primary">"{selectedJob?.title}"</strong>? This cannot be
            undone.
          </>
        }
      />
    </div>
  );
}
