import { useEffect, useState } from 'react';
import {
  Briefcase,
  Download,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  DeleteConfirmModal,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PageLoading,
  Pagination,
  SearchBar,
  SuccessBanner,
} from '../../components/ui';
import { getJobs, type JobPost } from '../../api/jobPost';
import {
  deleteJobApplication,
  exportJobApplications,
  getJobApplications,
  type JobApplication,
  type JobApplicationStatus,
} from '../../api/jobApplication';
import {
  ADMIN_ROLE_STORAGE_KEY,
  isSuperAdmin,
  triggerBlobDownload,
} from '../../utils/auth';
import { formatDate } from '../../utils/format';
import { axiosMessage } from '../../api/http';

const STATUS_OPTIONS: JobApplicationStatus[] = [
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
];

const STATUS_STYLES: Record<JobApplicationStatus, string> = {
  PENDING: 'bg-accent-info/10 text-accent-info border-accent-info/20',
  REVIEWING: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
  SHORTLISTED: 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20',
  INTERVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SELECTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-accent-danger/10 text-accent-danger border-accent-danger/20',
};

export interface JobApplicationListProps {
  onView: (id: string) => void;
  refreshKey?: number;
}

export default function JobApplicationList({
  onView,
  refreshKey = 0,
}: JobApplicationListProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JobApplicationStatus | ''>('');
  const [jobId, setJobId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const canExport = isSuperAdmin(localStorage.getItem(ADMIN_ROLE_STORAGE_KEY));

  const limit = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    getJobs({ page: 1, limit: 100 })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    loadApplications();
  }, [search, status, jobId, page, refreshKey]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJobApplications({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        jobId: jobId || undefined,
      });
      setApplications(response.data || []);
      setTotal(response.pagination?.total ?? 0);
      setTotalPages(response.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      setError(
        axiosMessage(
          err,
          'Failed to load applications. Make sure the backend is running.'
        )
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    setIsDeleting(true);
    try {
      await deleteJobApplication(selected.id);
      setIsDeleteOpen(false);
      setSelected(null);
      showSuccess('Application deleted successfully.');
      loadApplications();
    } catch {
      setError('Failed to delete application.');
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!canExport) return;
    setIsExporting(true);
    try {
      // Use current UI filters (including typed search before debounce settles)
      const activeSearch = searchInput.trim() || search;
      const blob = await exportJobApplications({
        search: activeSearch || undefined,
        status: status || undefined,
        jobId: jobId || undefined,
      });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      triggerBlobDownload(blob, `job-applications-${stamp}.xlsx`);
      const filterHint =
        activeSearch || status || jobId
          ? ' (current filters applied)'
          : '';
      showSuccess(`Applications exported to Excel${filterHint}.`);
    } catch {
      setError('Failed to export applications. Super admin access required.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <PageHeader
        trailing={
          <div className="flex items-center gap-3">
            {canExport && (
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-brand-border bg-brand-card/80 text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-accent-primary/30 disabled:opacity-60"
              >
                {isExporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {searchInput || status || jobId
                  ? 'Download Filtered Excel'
                  : 'Download Excel'}
              </button>
            )}
            <span className="text-xs text-text-secondary font-semibold">
              {total} total
            </span>
          </div>
        }
      />

      {successBanner && <SuccessBanner message={successBanner} variant="compact" />}

      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search by applicant name or email..."
      >
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as JobApplicationStatus | '');
            setPage(1);
          }}
          className="bg-brand-dark/50 border border-brand-border rounded-lg py-2 px-3 text-xs text-text-secondary outline-none cursor-pointer"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={jobId}
          onChange={(e) => {
            setJobId(e.target.value);
            setPage(1);
          }}
          className="bg-brand-dark/50 border border-brand-border rounded-lg py-2 px-3 text-xs text-text-secondary outline-none cursor-pointer max-w-[240px]"
        >
          <option value="">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </SearchBar>

      {error && (
        <ErrorBanner
          error={error}
          onRetry={loadApplications}
          title="API Error"
          retryLabel="Retry"
        />
      )}

      {loading ? (
        <PageLoading message="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="No Applications Found"
          description={
            search || status || jobId
              ? 'Try adjusting search or filters.'
              : 'Applications will appear here when candidates apply.'
          }
        />
      ) : (
        <>
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-dark/40">
                    {['Applicant', 'Email', 'Phone', 'Job', 'Status', 'Applied Date', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-brand-border/60 hover:bg-brand-hover/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-[13px] font-semibold text-text-primary">
                        {app.applicantName}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary">{app.email}</td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary">
                        {app.phone || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary max-w-[200px] truncate">
                        {app.job?.title || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${STATUS_STYLES[app.status]}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onView(app.id)}
                            className="cursor-pointer font-semibold text-[11px] py-1.5 px-2.5 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center gap-1.5 transition-all"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(app);
                              setIsDeleteOpen(true);
                            }}
                            className="cursor-pointer p-1.5 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
                            title="Delete application"
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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        isSubmitting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        description={
          <>
            Delete application from{' '}
            <strong className="text-text-primary">"{selected?.applicantName}"</strong>? The resume
            file will also be removed if present.
          </>
        }
      />
    </div>
  );
}
