import { useEffect, useState } from 'react';
import {
  deleteContactSubmission,
  exportContactSubmissions,
  getContactSubmissions,
  type ContactSubmission,
} from '../../../api/contact';
import { axiosMessage } from '../../../api/http';
import {
  ADMIN_ROLE_STORAGE_KEY,
  isSuperAdmin,
  triggerBlobDownload,
} from '../../../utils/auth';
import { buildExportFilename, QUERY_PAGE_SIZE } from '../utils/queryHelpers';

export function useQueryManagement() {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getContactSubmissions({
        page,
        limit: QUERY_PAGE_SIZE,
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

  useEffect(() => {
    loadQueries();
  }, [search, page]);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleView = (query: ContactSubmission) => {
    setSelected(query);
    setIsViewOpen(true);
  };

  const handleDeleteRequest = (query: ContactSubmission) => {
    setSelected(query);
    setIsDeleteOpen(true);
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
      triggerBlobDownload(blob, buildExportFilename());
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

  const handleDeleteFromView = () => {
    setIsViewOpen(false);
    setIsDeleteOpen(true);
  };

  return {
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
  };
}
