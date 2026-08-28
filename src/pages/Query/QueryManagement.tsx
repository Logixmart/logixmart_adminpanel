import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Download,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import {
  deleteContactSubmission,
  exportContactSubmissions,
  getContactSubmissions,
  type ContactSubmission,
} from '../../api/contact';
import {
  ADMIN_ROLE_STORAGE_KEY,
  isSuperAdmin,
  triggerBlobDownload,
} from '../../utils/auth';
import { formatDate, formatDateTime } from '../../utils/format';
import { axiosMessage } from '../../api/http';

export default function QueryManagement() {
  const [queries, setQueries] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
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
    loadQueries();
  }, [search, page]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getContactSubmissions({
        page,
        limit,
        search: search || undefined,
      });
      setQueries(response.data || []);
      setTotal(response.pagination?.total ?? 0);
      setTotalPages(response.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      setError(
        axiosMessage(err, 'Failed to load queries. Make sure the backend is running.')
      );
      setQueries([]);
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
      await deleteContactSubmission(selected.id);
      setIsDeleteOpen(false);
      setIsViewOpen(false);
      setSelected(null);
      showSuccess('Query deleted successfully.');
      loadQueries();
    } catch {
      setError('Failed to delete query.');
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!canExport) return;
    setIsExporting(true);
    try {
      const activeSearch = searchInput.trim() || search;
      const blob = await exportContactSubmissions({
        search: activeSearch || undefined,
      });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      triggerBlobDownload(blob, `queries-${stamp}.xlsx`);
      showSuccess(
        activeSearch
          ? 'Queries exported to Excel (current filters applied).'
          : 'Queries exported to Excel.'
      );
    } catch {
      setError('Failed to export queries. Super admin access required.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <MessageSquare size={22} className="text-accent-primary" />
            Query
          </h1>
          <p className="text-xs text-text-muted">
            Contact form submissions from the website.
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
              Download Excel
            </button>
          )}
          <span className="text-xs text-text-secondary font-semibold">{total} total</span>
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
            placeholder="Search by name, email, subject, or message..."
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
            <span className="text-xs font-semibold">API Error</span>
            <span className="text-[11px] text-accent-danger/80 mt-0.5">{error}</span>
          </div>
          <button
            type="button"
            onClick={loadQueries}
            className="ml-auto cursor-pointer font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 bg-accent-danger/10 border border-accent-danger/20 rounded hover:bg-accent-danger/20 transition-all text-accent-danger"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
          <span className="text-xs text-text-muted font-medium">Loading queries...</span>
        </div>
      ) : queries.length === 0 ? (
        <div className="glass-panel py-16 px-6 flex flex-col items-center justify-center text-center gap-4 max-w-[500px] mx-auto w-full mt-4">
          <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-border text-text-muted">
            <Mail size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-text-primary">No Queries Found</h3>
            <p className="text-xs text-text-secondary max-w-[340px]">
              {search
                ? 'Try adjusting your search.'
                : 'Queries will appear here when visitors submit the contact form.'}
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
                    {['Name', 'Email', 'Phone', 'Subject', 'Message', 'Date', 'Actions'].map(
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
                  {queries.map((query) => (
                    <tr
                      key={query.id}
                      className="border-b border-brand-border/60 hover:bg-brand-hover/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-[13px] font-semibold text-text-primary">
                        {query.name}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary">{query.email}</td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary">
                        {query.phone || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary max-w-[160px] truncate">
                        {query.subject || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary max-w-[220px] truncate">
                        {query.message}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(query.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(query);
                              setIsViewOpen(true);
                            }}
                            className="cursor-pointer font-semibold text-[11px] py-1.5 px-2.5 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center gap-1.5 transition-all"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(query);
                              setIsDeleteOpen(true);
                            }}
                            className="cursor-pointer p-1.5 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
                            title="Delete query"
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
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Query Details"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField label="Name" value={selected.name} />
              <DetailField label="Email" value={selected.email} />
              <DetailField label="Phone" value={selected.phone || '—'} />
              <DetailField label="Subject" value={selected.subject || '—'} />
              <DetailField
                label="Submitted"
                value={formatDateTime(selected.createdAt)}
                className="sm:col-span-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Message
              </span>
              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap bg-brand-dark/40 border border-brand-border rounded-lg p-3">
                {selected.message}
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <a
                href={`mailto:${selected.email}`}
                className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-accent-primary text-white hover:bg-accent-primary-hover flex items-center justify-center gap-2 transition-all no-underline"
              >
                <Mail size={14} /> Reply via Email
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  setIsDeleteOpen(true);
                }}
                className="cursor-pointer font-semibold py-2.5 px-4 rounded-lg text-xs bg-accent-danger/10 border border-accent-danger/20 text-accent-danger hover:bg-accent-danger/20 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !isDeleting && setIsDeleteOpen(false)}
        title="Delete Query"
      >
        <div className="flex flex-col gap-5">
          <p className="text-xs text-text-secondary leading-relaxed">
            Delete query from{' '}
            <strong className="text-text-primary">"{selected?.name}"</strong>? This cannot be
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

function DetailField({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs text-text-primary font-medium break-all">{value}</span>
    </div>
  );
}
