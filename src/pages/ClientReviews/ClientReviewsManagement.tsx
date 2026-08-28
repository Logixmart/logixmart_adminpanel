import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Edit3,
  Loader2,
  Mail,
  MessageSquareQuote,
  Plus,
  Search,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import type { ClientReview } from '../../api/clientReviews';
import {
  createClientReview,
  deleteClientReview,
  getClientReviews,
  updateClientReview,
} from '../../api/clientReviews';
import { formatDate } from '../../utils/format';
import { FIELD_INPUT_CLASS, FIELD_LABEL_CLASS } from '../../utils/styles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  clientName: '',
  companyName: '',
  email: '',
  designation: '',
  message: '',
};

export const ClientReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedReview, setSelectedReview] = useState<ClientReview | null>(
    null
  );

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchReviews(debouncedSearch);
  }, [debouncedSearch]);

  const fetchReviews = async (search = '') => {
    setIsLoading(true);
    setError(null);
    const result = await getClientReviews({
      page: 1,
      limit: 100,
      ...(search ? { search } : {}),
    });

    if (result.success && result.data) {
      setReviews(result.data);
      setTotal(result.pagination?.total ?? result.data.length);
    } else {
      setError(result.message || 'Failed to fetch client reviews');
      setReviews([]);
      setTotal(0);
    }
    setIsLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedReview(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (review: ClientReview) => {
    setModalMode('edit');
    setSelectedReview(review);
    setForm({
      clientName: review.clientName,
      companyName: review.companyName || '',
      email: review.email,
      designation: review.designation || '',
      message: review.message,
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (review: ClientReview) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const clientName = form.clientName.trim();
    const email = form.email.trim().toLowerCase();
    const message = form.message.trim();
    const companyName = form.companyName.trim();
    const designation = form.designation.trim();

    if (!clientName) {
      setFormError('Client name is required.');
      return;
    }
    if (!email) {
      setFormError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!message) {
      setFormError('Message is required.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      clientName,
      email,
      message,
      companyName,
      designation,
    };

    const response =
      modalMode === 'create'
        ? await createClientReview(payload)
        : selectedReview
          ? await updateClientReview(selectedReview.id, payload)
          : { success: false, message: 'No review selected.' };

    setIsSubmitting(false);

    if (response.success) {
      setIsFormModalOpen(false);
      fetchReviews(debouncedSearch);
      showSuccess(
        modalMode === 'create'
          ? 'Client review created successfully!'
          : 'Client review updated successfully!'
      );
    } else {
      setFormError(response.message || 'An error occurred during submission.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;
    setIsSubmitting(true);
    const response = await deleteClientReview(selectedReview.id);
    setIsSubmitting(false);
    setIsDeleteModalOpen(false);

    if (response.success) {
      fetchReviews(debouncedSearch);
      showSuccess('Client review deleted successfully!');
    } else {
      setError(response.message || 'Failed to delete client review');
    }
  };

  const companiesCount = new Set(
    reviews
      .map((r) => r.companyName?.trim())
      .filter((name): name is string => Boolean(name))
  ).size;

  const latestUpdate =
    reviews.length > 0
      ? formatDate(
          [...reviews].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0].updatedAt
        )
      : 'No updates';

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
      {successBanner && (
        <div className="bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/25 py-3.5 px-5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-[600px] mx-auto w-full shadow-lg shadow-accent-secondary/5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-ping" />
          {successBanner}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Client Reviews
          </h1>
          <p className="text-xs text-text-muted">
            Manage client testimonials shown on the company website.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="cursor-pointer font-semibold text-xs py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none flex items-center gap-2 transition-all duration-200 hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/20 self-start md:self-auto"
        >
          <Plus size={16} /> Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
            <Star size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Total Reviews
            </span>
            <span className="text-lg font-bold text-text-primary">{total}</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center text-accent-secondary border border-accent-secondary/20">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Companies
            </span>
            <span className="text-lg font-bold text-text-primary">
              {companiesCount}
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-info/10 flex items-center justify-center text-accent-info border border-accent-info/20">
            <Calendar size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Latest Update
            </span>
            <span className="text-sm font-bold text-text-primary">
              {latestUpdate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 bg-brand-card/50 border border-brand-border rounded-xl p-4">
        <div className="flex-1 relative flex items-center">
          <Search
            className="absolute left-3 text-text-muted pointer-events-none"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by client, company, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-9 bg-brand-dark/50 border border-brand-border rounded-lg outline-none text-xs text-text-primary transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/85"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
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
            <span className="text-[11px] text-accent-danger/80 mt-0.5">
              {error}
            </span>
          </div>
          <button
            onClick={() => fetchReviews(debouncedSearch)}
            className="ml-auto cursor-pointer font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 bg-accent-danger/10 border border-accent-danger/20 rounded hover:bg-accent-danger/20 transition-all text-accent-danger"
          >
            Retry Connection
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
          <span className="text-xs text-text-muted font-medium">
            Loading client reviews...
          </span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass-panel py-16 px-6 flex flex-col items-center justify-center text-center gap-4 max-w-[500px] mx-auto w-full mt-4">
          <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-border text-text-muted">
            <MessageSquareQuote size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-text-primary">
              {searchQuery ? 'No Results Found' : 'No Client Reviews Yet'}
            </h3>
            <p className="text-xs text-text-secondary max-w-[340px]">
              {searchQuery
                ? `We couldn't find any reviews matching "${searchQuery}". Try refining your keywords.`
                : 'Add your first client testimonial to display on the website.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="cursor-pointer font-bold text-[11px] uppercase tracking-wider mt-2 py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none transition-all hover:bg-accent-primary-hover"
            >
              Add First Review
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="group relative bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-brand-border-hover hover:shadow-xl hover:shadow-accent-primary-glow"
            >
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-text-primary text-[14.5px] truncate">
                        {review.clientName}
                      </h3>
                      <span className="text-[11px] text-text-muted truncate">
                        {[review.designation, review.companyName]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-brand-dark/80 border border-brand-border py-1 px-2 rounded-md text-text-secondary flex items-center gap-1 flex-shrink-0">
                    <Calendar size={11} className="text-accent-primary" />
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed line-clamp-4 flex-1">
                  “{review.message}”
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <Mail size={12} />
                  <span className="truncate">{review.email}</span>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-brand-border mt-1">
                  <button
                    onClick={() => handleOpenEdit(review)}
                    className="flex-1 cursor-pointer font-semibold text-[11px] py-2 px-3 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleOpenDelete(review)}
                    className="cursor-pointer p-2 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
                    title="Delete Review"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={
          modalMode === 'create' ? 'Add Client Review' : 'Edit Client Review'
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>
              Client Name
            </label>
            <input
              type="text"
              placeholder="e.g., Jane Smith"
              value={form.clientName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, clientName: e.target.value }))
              }
              disabled={isSubmitting}
              className={FIELD_INPUT_CLASS}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={FIELD_LABEL_CLASS}>
                Company (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Acme Corp"
                value={form.companyName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, companyName: e.target.value }))
                }
                disabled={isSubmitting}
                className={FIELD_INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={FIELD_LABEL_CLASS}>
                Designation (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., CTO"
                value={form.designation}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, designation: e.target.value }))
                }
                disabled={isSubmitting}
                className={FIELD_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>
              Email
            </label>
            <input
              type="email"
              placeholder="client@company.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={isSubmitting}
              className={FIELD_INPUT_CLASS}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>
              Review Message
            </label>
            <textarea
              placeholder="Write the client testimonial..."
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              disabled={isSubmitting}
              rows={4}
              className={`${FIELD_INPUT_CLASS} resize-none`}
              required
            />
          </div>

          <div className="flex gap-3 pt-3 mt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 cursor-pointer font-semibold py-2.5 border-none rounded-lg text-xs bg-accent-primary text-white hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  {modalMode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : modalMode === 'create' ? (
                'Create Review'
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
              className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-danger/5 border border-accent-danger/10 text-accent-danger text-xs leading-relaxed">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary">
                Warning: This action is irreversible!
              </span>
              <span>
                Deleting this review will permanently remove it from the website
                testimonials.
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary px-1">
            Are you sure you want to delete the review from{' '}
            <strong className="text-text-primary">
              "{selectedReview?.clientName}"
            </strong>
            ?
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="flex-1 cursor-pointer font-semibold py-2.5 border-none rounded-lg text-xs bg-accent-danger text-white hover:bg-accent-danger/90 hover:shadow-lg hover:shadow-accent-danger/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Deleting...
                </>
              ) : (
                'Delete Review'
              )}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
              className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientReviewsManagement;
