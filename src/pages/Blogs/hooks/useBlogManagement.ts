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
import type { Blog } from '../../../api/blogs';
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  updateBlog,
} from '../../../api/blogs';
import { resolveMediaUrl } from '../../../api/http';
import {
  buildBlogFormData,
  countBlogsWithImages,
  emptyForm,
  filterBlogs,
  getLatestUpdateLabel,
  sortBlogs,
  validateBlogForm,
  validateImageFile,
  type BlogFormValues,
  type BlogSortBy,
} from '../utils/blogHelpers';

export function useBlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<BlogSortBy>('newest');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const [form, setForm] = useState<BlogFormValues>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAllBlogs();
    if (result.success && result.data) {
      setBlogs(result.data);
    } else {
      setError(result.message || 'Failed to fetch blogs');
      setBlogs([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyImageFile = (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedBlog(null);
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setModalMode('edit');
    setSelectedBlog(blog);
    setForm({ title: blog.title, description: blog.description });
    setImageFile(null);
    setImagePreview(blog.imageUrl ? resolveMediaUrl(blog.imageUrl) : null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteModalOpen(true);
  };

  const handleOpenViewer = (imageUrl: string, title: string) => {
    setViewerImage(imageUrl);
    setViewerTitle(title);
    setViewerOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyImageFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) applyImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateBlogForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    const isImageRemoved = imageFile === null;
    setIsSubmitting(true);
    const formData = buildBlogFormData(form, imageFile, isImageRemoved);
    const response =
      modalMode === 'create'
        ? await createBlog(formData)
        : selectedBlog
          ? await updateBlog(selectedBlog.id, formData)
          : { success: false, message: 'No blog selected.' };

    setIsSubmitting(false);

    if (response.success) {
      setIsFormModalOpen(false);
      fetchBlogs();
      showSuccess(
        modalMode === 'create'
          ? 'Blog post created successfully!'
          : 'Blog post details updated successfully!'
      );
    } else {
      setFormError(response.message || 'An error occurred during submission.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBlog) return;
    setIsSubmitting(true);
    const response = await deleteBlog(selectedBlog.id);
    setIsSubmitting(false);
    setIsDeleteModalOpen(false);

    if (response.success) {
      fetchBlogs();
      showSuccess('Blog post and associated image deleted successfully!');
    } else {
      setError(response.message || 'Failed to delete blog post');
    }
  };

  const sortedBlogs = useMemo(
    () => sortBlogs(filterBlogs(blogs, searchQuery), sortBy),
    [blogs, searchQuery, sortBy]
  );

  const withImagesCount = useMemo(() => countBlogsWithImages(blogs), [blogs]);
  const latestUpdate = useMemo(() => getLatestUpdateLabel(blogs), [blogs]);

  return {
    blogs,
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
    total: blogs.length,
  };
}
