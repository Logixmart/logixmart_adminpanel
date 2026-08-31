import React from 'react';
import { FileText } from 'lucide-react';
import {
  DeleteConfirmModal,
  EmptyState,
  ErrorBanner,
  ImageViewer,
  PageHeader,
  PageLoading,
  SearchBar,
  SuccessBanner,
} from '../../components/ui';
import { useBlogManagement } from './hooks/useBlogManagement';
import {
  BlogFormModal,
  BlogGrid,
  BlogSortSelect,
  BlogStats,
} from './components';

export const BlogsManagement: React.FC = () => {
  const {
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isFormModalOpen,
    setIsFormModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    modalMode,
    selectedBlog,
    form,
    setForm,
    imagePreview,
    formError,
    isSubmitting,
    successBanner,
    viewerOpen,
    setViewerOpen,
    viewerImage,
    viewerTitle,
    fileInputRef,
    fetchBlogs,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenViewer,
    handleImageChange,
    handleDrop,
    handleRemoveImage,
    handleSubmit,
    handleDeleteConfirm,
    sortedBlogs,
    withImagesCount,
    latestUpdate,
    total,
  } = useBlogManagement();

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
      {successBanner && <SuccessBanner message={successBanner} />}

      <PageHeader action={{ label: 'Create Blog Post', onClick: handleOpenCreate }} />

      <BlogStats
        total={total}
        withImagesCount={withImagesCount}
        latestUpdate={latestUpdate}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search articles by title or content..."
      >
        <BlogSortSelect value={sortBy} onChange={setSortBy} />
      </SearchBar>

      {error && <ErrorBanner error={error} onRetry={fetchBlogs} />}

      {isLoading ? (
        <PageLoading message="Querying blog repository..." />
      ) : sortedBlogs.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title={searchQuery ? 'No Results Found' : 'No Blog Posts Created'}
          description={
            searchQuery
              ? `We couldn't find any articles matching "${searchQuery}". Try refining your keywords.`
              : 'Get started by creating your first article to display on the company website.'
          }
          action={
            !searchQuery
              ? { label: 'Add First Article', onClick: handleOpenCreate }
              : undefined
          }
        />
      ) : (
        <BlogGrid
          blogs={sortedBlogs}
          onViewImage={handleOpenViewer}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      <BlogFormModal
        isOpen={isFormModalOpen}
        modalMode={modalMode}
        form={form}
        formError={formError}
        isSubmitting={isSubmitting}
        imagePreview={imagePreview}
        fileInputRef={fileInputRef}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onRemoveImage={handleRemoveImage}
        onImageChange={handleImageChange}
        onDrop={handleDrop}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete Article"
        warning={{
          message:
            'Deleting this blog post will permanently erase it from the registry and remove its image asset from the server directory.',
        }}
        description={
          <>
            Are you sure you want to delete the article:{' '}
            <strong className="text-text-primary">"{selectedBlog?.title}"</strong>?
          </>
        }
      />

      <ImageViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={viewerImage ? [viewerImage] : []}
        title={viewerTitle}
      />
    </div>
  );
};

export default BlogsManagement;
