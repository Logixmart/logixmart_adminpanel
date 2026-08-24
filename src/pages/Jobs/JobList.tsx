import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
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
      const axiosErr = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      const apiMessage = axiosErr.response?.data?.message;
      const status = axiosErr.response?.status;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Briefcase size={22} className="text-accent-primary" />
            Jobs Management Portal
          </h1>
          <p className="text-xs text-text-muted">
            Create and manage career openings for the company website.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="cursor-pointer font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/25 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} /> Create Job Post
        </button>
      </div>

      {successBanner && (
        <div className="bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 py-3 px-4 rounded-md text-xs font-semibold text-center">
          {successBanner}
        </div>
      )}

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

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 bg-brand-card/50 border border-brand-border rounded-xl p-4">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-3 text-text-muted pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search jobs by title, company, or skills..."
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
      </div>

      {error && (
        <div className="glass-panel p-6 border-accent-danger/25 bg-accent-danger/5 flex items-center gap-3 text-accent-danger max-w-[600px] mx-auto w-full">
          <AlertCircle size={20} />
          <div className="flex flex-col">
            <span className="text-xs font-semibold">API Connection Error</span>
            <span className="text-[11px] text-accent-danger/80 mt-0.5">{error}</span>
          </div>
          <button
            type="button"
            onClick={loadJobs}
            className="ml-auto cursor-pointer font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 bg-accent-danger/10 border border-accent-danger/20 rounded hover:bg-accent-danger/20 transition-all text-accent-danger"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
          <span className="text-xs text-text-muted font-medium">Loading job posts...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel py-16 px-6 flex flex-col items-center justify-center text-center gap-4 max-w-[500px] mx-auto w-full mt-4">
          <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-border text-text-muted">
            <Briefcase size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-text-primary">
              {search ? 'No Results Found' : 'No Job Posts Yet'}
            </h3>
            <p className="text-xs text-text-secondary max-w-[340px]">
              {search
                ? `No jobs matched "${search}". Try different keywords.`
                : 'Create your first job opening to list it on the careers page.'}
            </p>
          </div>
          {!search && (
            <button
              type="button"
              onClick={onCreate}
              className="cursor-pointer font-bold text-[11px] uppercase tracking-wider mt-2 py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none transition-all hover:bg-accent-primary-hover"
            >
              Add First Job
            </button>
          )}
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-brand-border bg-brand-dark/40">
                  {['Title', 'Company', 'Location', 'Type', 'Status', 'Actions'].map((h) => (
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
                    <td className="px-4 py-3.5 text-xs text-text-secondary">{job.companyName}</td>
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

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !isDeleting && setIsDeleteOpen(false)}
        title="Delete Job Post"
      >
        <div className="flex flex-col gap-5">
          <p className="text-xs text-text-secondary leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-text-primary">"{selectedJob?.title}"</strong>? This cannot be
            undone.
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
                'Delete Job'
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
