import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import type { Work, WorkImageItem } from '../../../api/work';
import {
  createWork,
  deleteWork,
  getWorkImageItems,
  getWorks,
  updateWork,
} from '../../../api/work';
import {
  PAGE_SIZE,
  buildWorkFormData,
  countWorksWithImages,
  emptyForm,
  filterWorks,
  getLatestUpdateLabel,
  mapWorksWithImages,
  paginateWorks,
  pickValidImages,
  validateWorkForm,
  type WorkFormValues,
} from '../utils/workHelpers';

export function useWorkManagement() {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const [form, setForm] = useState<WorkFormValues>(emptyForm);
  const [existingImages, setExistingImages] = useState<WorkImageItem[]>([]);
  const [removedImageKeys, setRemovedImageKeys] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerTitle, setViewerTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWorks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getWorks();

    if (result.success && result.data) {
      setWorks(result.data);
    } else {
      setError(result.message || 'Failed to fetch work items');
      setWorks([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setExistingImages([]);
    setRemovedImageKeys([]);
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewFiles([]);
    setNewPreviews([]);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedWork(null);
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (work: Work) => {
    setModalMode('edit');
    setSelectedWork(work);
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setForm({
      title: work.title,
      description: work.description,
      websiteUrl: work.websiteUrl || '',
      appStoreUrl: work.appStoreUrl || '',
      playStoreUrl: work.playStoreUrl || '',
      category: work.category || '',
    });
    setExistingImages(getWorkImageItems(work));
    setRemovedImageKeys([]);
    setNewFiles([]);
    setNewPreviews([]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (work: Work) => {
    setSelectedWork(work);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewer = (
    urls: string[],
    startIndex = 0,
    title = ''
  ) => {
    if (urls.length === 0) return;
    setViewerImages(urls);
    setViewerIndex(startIndex);
    setViewerTitle(title);
    setViewerOpen(true);
  };

  const visibleExisting = useMemo(
    () => existingImages.filter((img) => !removedImageKeys.includes(img.key)),
    [existingImages, removedImageKeys]
  );
  const totalImageCount = visibleExisting.length + newFiles.length;
  const formPreviewUrls = useMemo(
    () => [...visibleExisting.map((item) => item.url), ...newPreviews],
    [visibleExisting, newPreviews]
  );

  const worksWithImages = useMemo(
    () => mapWorksWithImages(works),
    [works]
  );

  const filteredWorks = useMemo(
    () => filterWorks(worksWithImages, searchQuery),
    [worksWithImages, searchQuery]
  );

  const { totalPages, currentPage, paged: pagedWorks } = paginateWorks(
    filteredWorks,
    page,
    PAGE_SIZE
  );

  const withImagesCount = useMemo(
    () => countWorksWithImages(worksWithImages),
    [worksWithImages]
  );

  const latestUpdate = useMemo(
    () => getLatestUpdateLabel(works),
    [works]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const addFiles = (files: File[]) => {
    const { accepted, error: fileError } = pickValidImages(
      files,
      totalImageCount
    );
    if (accepted.length === 0) {
      if (fileError) setFormError(fileError);
      return;
    }

    setFormError(null);
    setNewFiles((prev) => [...prev, ...accepted]);
    setNewPreviews((prev) => [
      ...prev,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files || []));
  };

  const handleRemoveNewFile = (index: number) => {
    setNewPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExisting = (key: string) => {
    setRemovedImageKeys((prev) =>
      prev.includes(key) ? prev : [...prev, key]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateWorkForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    const formData = buildWorkFormData(
      form,
      newFiles,
      modalMode,
      removedImageKeys
    );

    const response =
      modalMode === 'create'
        ? await createWork(formData)
        : selectedWork
          ? await updateWork(selectedWork.id, formData)
          : { success: false, message: 'No work item selected.' };

    setIsSubmitting(false);

    if (response.success) {
      setIsFormModalOpen(false);
      fetchWorks();
      showSuccess(
        modalMode === 'create'
          ? 'Work item created successfully!'
          : 'Work item updated successfully!'
      );
    } else {
      setFormError(response.message || 'An error occurred during submission.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWork) return;
    setIsSubmitting(true);
    const response = await deleteWork(selectedWork.id);
    setIsSubmitting(false);
    setIsDeleteModalOpen(false);

    if (response.success) {
      fetchWorks();
      showSuccess('Work item deleted successfully!');
    } else {
      setError(response.message || 'Failed to delete work item');
    }
  };

  return {
    works,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    page,
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
    total: works.length,
    newPreviews,
    handleImageChange,
    handleDrop,
    handleRemoveNewFile,
    handleRemoveExisting,
    handleSubmit,
    handleDeleteConfirm,
  };
}
