import React from 'react';
import { Briefcase } from 'lucide-react';
import {
  DeleteConfirmModal,
  EmptyState,
  ErrorBanner,
  ImageViewer,
  PageHeader,
  PageLoading,
  Pagination,
  SearchBar,
  SuccessBanner,
} from '../../components/ui';
import { useWorkManagement } from './hooks/useWorkManagement';
import {
  WorkFormModal,
  WorkGrid,
  WorkStats,
} from './components';

const WorkManagement: React.FC = () => {
  const {
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    setPage,
    isFormModalOpen,
    setIsFormModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    modalMode,
    selectedWork,
    form,
    setForm,
    formError,
    isSubmitting,
    successBanner,
    viewerOpen,
    setViewerOpen,
    viewerImages,
    viewerIndex,
    viewerTitle,
    fileInputRef,
    fetchWorks,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenViewer,
    visibleExisting,
    totalImageCount,
    formPreviewUrls,
    filteredWorks,
    pagedWorks,
    totalPages,
    currentPage,
    withImagesCount,
    latestUpdate,
    total,
    newPreviews,
    handleImageChange,
    handleDrop,
    handleRemoveNewFile,
    handleRemoveExisting,
    handleSubmit,
    handleDeleteConfirm,
  } = useWorkManagement();

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
      {successBanner && <SuccessBanner message={successBanner} />}

      <PageHeader action={{ label: 'Add Work', onClick: handleOpenCreate }} />

      <WorkStats
        total={total}
        withImagesCount={withImagesCount}
        latestUpdate={latestUpdate}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by title or description..."
      />

      {error && <ErrorBanner error={error} onRetry={fetchWorks} />}

      {isLoading ? (
        <PageLoading message="Loading work items..." />
      ) : filteredWorks.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title={searchQuery ? 'No Results Found' : 'No Work Items Yet'}
          description={
            searchQuery
              ? `We couldn't find any projects matching "${searchQuery}". Try refining your keywords.`
              : 'Add your first portfolio project to display on the website.'
          }
          action={
            !searchQuery
              ? { label: 'Add First Project', onClick: handleOpenCreate }
              : undefined
          }
        />
      ) : (
        <>
          <WorkGrid
            items={pagedWorks}
            onViewImages={handleOpenViewer}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <WorkFormModal
        isOpen={isFormModalOpen}
        modalMode={modalMode}
        form={form}
        formError={formError}
        isSubmitting={isSubmitting}
        visibleExisting={visibleExisting}
        newPreviews={newPreviews}
        formPreviewUrls={formPreviewUrls}
        totalImageCount={totalImageCount}
        fileInputRef={fileInputRef}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onOpenViewer={handleOpenViewer}
        onRemoveExisting={handleRemoveExisting}
        onRemoveNewFile={handleRemoveNewFile}
        onImageChange={handleImageChange}
        onDrop={handleDrop}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete Work"
        warning={{
          message:
            'Deleting this project will permanently remove it and its images from the website.',
        }}
        description={
          <>
            Are you sure you want to delete{' '}
            <strong className="text-text-primary">"{selectedWork?.title}"</strong>?
          </>
        }
      />

      <ImageViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImages}
        startIndex={viewerIndex}
        title={viewerTitle}
      />
    </div>
  );
};

export default WorkManagement;
