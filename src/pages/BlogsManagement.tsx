import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  ArrowUpDown, 
  Upload, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import type { Blog } from '../api/blogs';
import { 
  getAllBlogs, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} from '../api/blogs';

export const BlogsManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Selected Item States
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action status banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAllBlogs();
    if (result.success && result.data) {
      setBlogs(result.data);
    } else {
      setError(result.message || 'Failed to fetch blogs');
    }
    setIsLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (blog: Blog) => {
    setModalMode('edit');
    setSelectedBlog(blog);
    setTitle(blog.title);
    setDescription(blog.description);
    setImageFile(null);
    // Support relative paths if backend is configured differently
    const fullImageUrl = blog.imageUrl.startsWith('http') 
      ? blog.imageUrl 
      : `http://localhost:5000${blog.imageUrl}`;
    setImagePreview(fullImageUrl);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Delete modal
  const handleOpenDelete = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteModalOpen(true);
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image file size must be less than 5MB.');
        return;
      }
      // Validate file type
      if (!file.type.match('image.*')) {
        setFormError('Only image files are allowed.');
        return;
      }

      setFormError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image file size must be less than 5MB.');
        return;
      }
      if (!file.type.match('image.*')) {
        setFormError('Only image files are allowed.');
        return;
      }
      setFormError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Create or Update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required.');
      return;
    }
    if (modalMode === 'create' && !imageFile) {
      setFormError('An image file is required for new blog posts.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    if (imageFile) {
      formData.append('image', imageFile);
    }

    let response;
    if (modalMode === 'create') {
      response = await createBlog(formData);
    } else {
      if (!selectedBlog) return;
      response = await updateBlog(selectedBlog.id, formData);
    }

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

  // Handle Delete confirm
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

  // Filter and sort blogs
  const filteredBlogs = blogs.filter(blog => {
    const query = searchQuery.toLowerCase();
    return (
      blog.title.toLowerCase().includes(query) || 
      blog.description.toLowerCase().includes(query)
    );
  });

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
      {/* Top Banner Success Notification */}
      {successBanner && (
        <div className="bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/25 py-3.5 px-5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-[600px] mx-auto w-full shadow-lg shadow-accent-secondary/5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-ping" />
          {successBanner}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Blogs Management Portal
          </h1>
          <p className="text-xs text-text-muted">
            Configure system articles, update marketing content, and manage active media assets.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="cursor-pointer font-semibold text-xs py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none flex items-center gap-2 transition-all duration-200 hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/20 self-start md:self-auto"
        >
          <Plus size={16} /> Create Blog Post
        </button>
      </div>

      {/* Dashboard Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Articles</span>
            <span className="text-lg font-bold text-text-primary">{blogs.length}</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center text-accent-secondary border border-accent-secondary/20">
            <ImageIcon size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Media Files Stored</span>
            <span className="text-lg font-bold text-text-primary">
              {blogs.filter(b => b.imageUrl).length}
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-info/10 flex items-center justify-center text-accent-info border border-accent-info/20">
            <Calendar size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Latest Update</span>
            <span className="text-sm font-bold text-text-primary">
              {blogs.length > 0 ? formatDate(blogs[0].updatedAt) : 'No updates'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 bg-brand-card/50 border border-brand-border rounded-xl p-4">
        {/* Search */}
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-3 text-text-muted pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search articles by title or content..."
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

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-brand-dark/50 border border-brand-border rounded-lg py-2 px-3 text-xs text-text-secondary outline-none cursor-pointer hover:border-brand-border-hover transition-colors"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="title">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-panel p-6 border-accent-danger/25 bg-accent-danger/5 flex items-center gap-3 text-accent-danger max-w-[600px] mx-auto w-full">
          <AlertCircle size={20} />
          <div className="flex flex-col">
            <span className="text-xs font-semibold">API Connection Error</span>
            <span className="text-[11px] text-accent-danger/80 mt-0.5">{error}</span>
          </div>
          <button 
            onClick={fetchBlogs}
            className="ml-auto cursor-pointer font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 bg-accent-danger/10 border border-accent-danger/20 rounded hover:bg-accent-danger/20 transition-all text-accent-danger"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
          <span className="text-xs text-text-muted font-medium">Querying blog repository...</span>
        </div>
      ) : sortedBlogs.length === 0 ? (
        /* Empty State */
        <div className="glass-panel py-16 px-6 flex flex-col items-center justify-center text-center gap-4 max-w-[500px] mx-auto w-full mt-4">
          <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-border text-text-muted">
            <FileText size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-text-primary">
              {searchQuery ? 'No Results Found' : 'No Blog Posts Created'}
            </h3>
            <p className="text-xs text-text-secondary max-w-[340px]">
              {searchQuery 
                ? `We couldn't find any articles matching "${searchQuery}". Try refining your keywords.`
                : 'Get started by creating your first article to display on the company website.'
              }
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="cursor-pointer font-bold text-[11px] uppercase tracking-wider mt-2 py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none transition-all hover:bg-accent-primary-hover"
            >
              Add First Article
            </button>
          )}
        </div>
      ) : (
        /* Blog Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBlogs.map((blog) => {
            const fullImageUrl = blog.imageUrl.startsWith('http') 
              ? blog.imageUrl 
              : `http://localhost:5000${blog.imageUrl}`;
            return (
              <div 
                key={blog.id} 
                className="group relative bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-brand-border-hover hover:shadow-xl hover:shadow-accent-primary-glow"
              >
                {/* Blog Image Header */}
                <div className="h-44 w-full bg-brand-dark relative overflow-hidden border-b border-brand-border">
                  <img 
                    src={fullImageUrl} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // fallback for image load error
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60" />
                  
                  {/* Category / Date Badge */}
                  <span className="absolute bottom-3 left-4 text-[10px] font-semibold bg-brand-dark/80 backdrop-blur border border-brand-border py-1 px-2.5 rounded-md text-text-primary flex items-center gap-1.5 shadow-sm">
                    <Calendar size={11} className="text-accent-primary" />
                    {formatDate(blog.createdAt)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col gap-2.5">
                  <h3 className="font-bold text-text-primary text-[14.5px] leading-snug group-hover:text-accent-primary transition-colors duration-200 line-clamp-1">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 flex-1">
                    {blog.description}
                  </p>
                  
                  {/* Actions footer */}
                  <div className="flex items-center gap-3 pt-4 border-t border-brand-border mt-2">
                    <button
                      onClick={() => handleOpenEdit(blog)}
                      className="flex-1 cursor-pointer font-semibold text-[11px] py-2 px-3 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    
                    <button
                      onClick={() => handleOpenDelete(blog)}
                      className="cursor-pointer p-2 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger hover:text-white rounded-md flex items-center justify-center transition-all"
                      title="Delete Article"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post Details'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title field */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Article Title</label>
            <input
              type="text"
              placeholder="e.g., Implementing Secure Web Sockets in Production"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary outline-none text-xs transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow disabled:opacity-50"
              required
            />
          </div>

          {/* Description field */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Description / Body Content</label>
            <textarea
              placeholder="Describe the main focus and takeaways of this article..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="w-full py-2.5 px-4 bg-brand-dark/60 border border-brand-border rounded-md text-text-primary outline-none text-xs transition-all duration-200 focus:border-accent-primary focus:bg-brand-dark/90 focus:ring-2 focus:ring-accent-primary-glow disabled:opacity-50 resize-none"
              required
            />
          </div>

          {/* Image Upload field */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Featured Image</label>
            
            {imagePreview ? (
              /* Image Preview Area */
              <div className="relative w-full h-44 rounded-lg overflow-hidden border border-brand-border bg-brand-dark/40 group">
                <img 
                  src={imagePreview} 
                  alt="Upload preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="p-2 rounded-full bg-accent-danger text-white border-none cursor-pointer flex items-center justify-center hover:bg-accent-danger/80 hover:scale-105 transition-all shadow-md disabled:opacity-50"
                    title="Remove Image"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              /* Upload File Zone */
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="w-full h-44 border-2 border-dashed border-brand-border hover:border-accent-primary/50 bg-brand-dark/20 hover:bg-brand-dark/40 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="w-11 h-11 rounded-full bg-brand-dark/80 border border-brand-border flex items-center justify-center text-text-muted group-hover:text-accent-primary group-hover:border-accent-primary/25 transition-all">
                  <Upload size={18} />
                </div>
                <div className="flex flex-col items-center text-center px-4">
                  <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                    Click to upload or drag & drop
                  </span>
                  <span className="text-[10px] text-text-muted mt-1">
                    JPEG, JPG, PNG, GIF, or WEBP (Max 5MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 mt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 cursor-pointer font-semibold py-2.5 border-none rounded-lg text-xs bg-accent-primary text-white hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  {modalMode === 'create' ? 'Creating Article...' : 'Saving Changes...'}
                </>
              ) : (
                <>
                  {modalMode === 'create' ? 'Create Article' : 'Save Changes'}
                </>
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

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-danger/5 border border-accent-danger/10 text-accent-danger text-xs leading-relaxed">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary">Warning: This action is irreversible!</span>
              <span>
                Deleting this blog post will permanently erase it from the registry and remove its image asset from the server directory.
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary px-1">
            Are you sure you want to delete the article: <strong className="text-text-primary">"{selectedBlog?.title}"</strong>?
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
                'Delete Article'
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

export default BlogsManagement;
