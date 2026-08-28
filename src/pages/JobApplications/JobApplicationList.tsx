import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  ClipboardList,
  Download,
  Eye,
  Loader2,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-accent-primary" />
            Job Applications
          </h1>
          <p className="text-xs text-text-muted">
            Review candidate submissions, update status, and download resumes.
          </p>
        </div>
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
      </div>

      {successBanner && (
        <div className="bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 py-3 px-4 rounded-md text-xs font-semibold text-center">
          {successBanner}
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5 bg-brand-card/50 border border-brand-border rounded-xl p-4">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-3 text-text-muted pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search by applicant name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full py-2 px-9 bg-brand-dark/50 border border-brand-border rounded-lg outline-none text-xs text-text-primary transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/85"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer flex items-center"
            >
              <X size={14} />
            </button>
          )}
        </div>
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
      </div>

      {error && (
        <div className="glass-panel p-6 border-accent-danger/25 bg-accent-danger/5 flex items-center gap-3 text-accent-danger max-w-[600px] mx-auto w-full">
          <AlertCircle size={20} />
          <div className="flex flex-col">
            <span className="text-xs font-semibold">API Error</span>
            <span className="text-[11px] text-accent-danger/80 mt-0.5">{error}</span>
          </div>
          <button
            type="button"
            onClick={loadApplications}
            className="ml-auto cursor-pointer font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 bg-accent-danger/10 border border-accent-danger/20 rounded hover:bg-accent-danger/20 transition-all text-accent-danger"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
          <span className="text-xs text-text-muted font-medium">Loading applications...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel py-16 px-6 flex flex-col items-center justify-center text-center gap-4 max-w-[500px] mx-auto w-full mt-4">
          <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-border text-text-muted">
            <Briefcase size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-text-primary">No Applications Found</h3>
            <p className="text-xs text-text-secondary max-w-[340px]">
              {search || status || jobId
                ? 'Try adjusting search or filters.'
                : 'Applications will appear here when candidates apply.'}
            </p>
          </div>
        </div>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer text-xs py-2 px-3 rounded-md border border-brand-border text-text-secondary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer text-xs py-2 px-3 rounded-md border border-brand-border text-text-secondary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !isDeleting && setIsDeleteOpen(false)}
        title="Delete Application"
      >
        <div className="flex flex-col gap-5">
          <p className="text-xs text-text-secondary leading-relaxed">
            Delete application from{' '}
            <strong className="text-text-primary">"{selected?.applicantName}"</strong>? The resume
            file will also be removed if present.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 cursor-pointer font-semibold py-2.5 border-none rounded-lg text-xs bg-accent-danger text-white hover:bg-accent-danger/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
