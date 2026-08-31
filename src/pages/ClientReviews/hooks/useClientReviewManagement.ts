import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { ClientReview } from '../../../api/clientReviews';
import {
  createClientReview,
  deleteClientReview,
  getClientReviews,
  updateClientReview,
} from '../../../api/clientReviews';
import {
  buildClientReviewPayload,
  countUniqueCompanies,
  emptyForm,
  getLatestReviewUpdate,
  toFormValues,
  validateClientReviewForm,
  type ClientReviewFormValues,
} from '../utils/clientReviewHelpers';

export function useClientReviewManagement() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedReview, setSelectedReview] = useState<ClientReview | null>(null);

  const [form, setForm] = useState<ClientReviewFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  useEffect(() => {
    fetchReviews(debouncedSearch);
  }, [debouncedSearch]);

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
    setForm(toFormValues(review));
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (review: ClientReview) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateClientReviewForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    const payload = buildClientReviewPayload(form);

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

  const companiesCount = useMemo(
    () => countUniqueCompanies(reviews),
    [reviews]
  );
  const latestUpdate = useMemo(
    () => getLatestReviewUpdate(reviews),
    [reviews]
  );

  return {
    reviews,
    total,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isFormModalOpen,
    setIsFormModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    modalMode,
    selectedReview,
    form,
    setForm,
    formError,
    isSubmitting,
    successBanner,
    fetchReviews: () => fetchReviews(debouncedSearch),
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleSubmit,
    handleDeleteConfirm,
    companiesCount,
    latestUpdate,
  };
}
