import React from 'react';
import { MessageSquareQuote } from 'lucide-react';
import {
  DeleteConfirmModal,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PageLoading,
  SearchBar,
  SuccessBanner,
} from '../../components/ui';
import { useClientReviewManagement } from './hooks/useClientReviewManagement';
import {
  ClientReviewFormModal,
  ClientReviewGrid,
  ClientReviewStats,
} from './components';

export const ClientReviewsManagement: React.FC = () => {
  const {
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
    fetchReviews,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleSubmit,
    handleDeleteConfirm,
    companiesCount,
    latestUpdate,
  } = useClientReviewManagement();

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
      {successBanner && <SuccessBanner message={successBanner} />}

      <PageHeader action={{ label: 'Add Review', onClick: handleOpenCreate }} />

      <ClientReviewStats
        total={total}
        companiesCount={companiesCount}
        latestUpdate={latestUpdate}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by client, company, email, or message..."
      />

      {error && <ErrorBanner error={error} onRetry={fetchReviews} />}

      {isLoading ? (
        <PageLoading message="Loading client reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote size={28} />}
          title={searchQuery ? 'No Results Found' : 'No Client Reviews Yet'}
          description={
            searchQuery
              ? `We couldn't find any reviews matching "${searchQuery}". Try refining your keywords.`
              : 'Add your first client testimonial to display on the website.'
          }
          action={
            !searchQuery
              ? { label: 'Add First Review', onClick: handleOpenCreate }
              : undefined
          }
        />
      ) : (
        <ClientReviewGrid
          reviews={reviews}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      <ClientReviewFormModal
        isOpen={isFormModalOpen}
        modalMode={modalMode}
        form={form}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete Review"
        warning={{
          message:
            'Deleting this review will permanently remove it from the website testimonials.',
        }}
        description={
          <>
            Are you sure you want to delete the review from{' '}
            <strong className="text-text-primary">
              "{selectedReview?.clientName}"
            </strong>
            ?
          </>
        }
      />
    </div>
  );
};

export default ClientReviewsManagement;
