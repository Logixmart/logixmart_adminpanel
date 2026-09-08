import { Mail } from 'lucide-react';
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
import { useQueryManagement } from './hooks/useQueryManagement';
import { QueryTable, QueryToolbar, QueryViewModal } from './components';

export default function QueryManagement() {
  const {
    queries,
    loading,
    error,
    searchInput,
    setSearchInput,
    search,
    page,
    setPage,
    totalPages,
    total,
    selected,
    isViewOpen,
    setIsViewOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isDeleting,
    successBanner,
    isExporting,
    canExport,
    loadQueries,
    handleView,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleExportExcel,
    handleDeleteFromView,
  } = useQueryManagement();

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <PageHeader
        trailing={
          <QueryToolbar
            total={total}
            canExport={canExport}
            isExporting={isExporting}
            onExport={handleExportExcel}
          />
        }
      />

      {successBanner && <SuccessBanner message={successBanner} variant="compact" />}

      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search by name, email, subject, or message..."
      />

      {error && (
        <ErrorBanner
          error={error}
          onRetry={loadQueries}
          title="API Error"
          retryLabel="Retry"
        />
      )}

      {loading ? (
        <PageLoading message="Loading queries..." />
      ) : queries.length === 0 ? (
        <EmptyState
          icon={<Mail size={28} />}
          title="No Queries Found"
          description={
            search
              ? 'Try adjusting your search.'
              : 'Queries will appear here when visitors submit the contact form.'
          }
        />
      ) : (
        <>
          <QueryTable
            queries={queries}
            onView={handleView}
            onDelete={handleDeleteRequest}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <QueryViewModal
        isOpen={isViewOpen}
        query={selected}
        onClose={() => setIsViewOpen(false)}
        onDelete={handleDeleteFromView}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        isSubmitting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Query"
        description={
          <>
            Delete query from{' '}
            <strong className="text-text-primary">"{selected?.name}"</strong>? This cannot be
            undone.
          </>
        }
      />
    </div>
  );
}
