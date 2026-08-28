import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ImageViewer } from '../../components/ui/ImageViewer';
import type { Work, WorkImageItem } from '../../api/work';
import {
  createWork,
  deleteWork,
  getWorkImageItems,
  getWorks,
  updateWork,
} from '../../api/work';
import { formatDate } from '../../utils/format';
import { FIELD_INPUT_CLASS, FIELD_LABEL_CLASS } from '../../utils/styles';

const PAGE_SIZE = 12;
const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const emptyForm = {
  title: '',
  description: '',
  projectUrl: '',
  webAppUrl: '',
};

function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const WorkManagement: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const [form, setForm] = useState(emptyForm);
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
      projectUrl: work.projectUrl || '',
      webAppUrl: work.webAppUrl || '',
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
    () =>
      works.map((work) => ({
        work,
        images: getWorkImageItems(work),
      })),
    [works]
  );

  const filteredWorks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return worksWithImages;
    return worksWithImages.filter(
      ({ work }) =>
        work.title.toLowerCase().includes(query) ||
        work.description.toLowerCase().includes(query)
    );
  }, [worksWithImages, searchQuery]);

  const total = works.length;
  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedWorks = filteredWorks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const withImagesCount = useMemo(
    () => worksWithImages.filter(({ images }) => images.length > 0).length,
    [worksWithImages]
  );

  const latestUpdate = useMemo(() => {
    if (works.length === 0) return 'No updates';
    const latestWork = [...works].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })[0];
    return formatDate(latestWork.updatedAt || latestWork.createdAt);
  }, [works]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const addFiles = (files: File[]) => {
    const accepted: File[] = [];
    for (const file of files) {
      if (totalImageCount + accepted.length >= MAX_IMAGES) {
        setFormError(`You can upload a maximum of ${MAX_IMAGES} images.`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFormError('Each image must be less than 5MB.');
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFormError('Only JPEG, JPG, PNG, or WEBP images are allowed.');
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    setFormError(null);
    setNewFiles((prev) => [...prev, ...accepted]);
    setNewPreviews((prev) => [
      ...prev,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const title = form.title.trim();
    const description = form.description.trim();
    const projectUrl = form.projectUrl.trim();
    const webAppUrl = form.webAppUrl.trim();

    if (!title) {
      setFormError('Title is required.');
      return;
    }
    if (!description) {
      setFormError('Description is required.');
      return;
    }
    if (!isValidUrl(projectUrl)) {
      setFormError('Project URL must be a valid http(s) link.');
      return;
    }
    if (!isValidUrl(webAppUrl)) {
      setFormError('Web app URL must be a valid http(s) link.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('projectUrl', projectUrl);
    formData.append('webAppUrl', webAppUrl);
    newFiles.forEach((file) => formData.append('images', file));

    if (modalMode === 'edit' && removedImageKeys.length > 0) {
      formData.append('removeImages', JSON.stringify(removedImageKeys));
    }

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
            Our Work
          </h1>
          <p className="text-xs text-text-muted">
            Manage portfolio projects shown on the company website.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="cursor-pointer font-semibold text-xs py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none flex items-center gap-2 transition-all duration-200 hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/20 self-start md:self-auto"
        >
          <Plus size={16} /> Add Work
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
            <Briefcase size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Total Projects
            </span>
            <span className="text-lg font-bold text-text-primary">{total}</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center text-accent-secondary border border-accent-secondary/20">
            <ImageIcon size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              With Images
            </span>
            <span className="text-lg font-bold text-text-primary">
              {withImagesCount}
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
            placeholder="Search by title or description..."
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
            onClick={fetchWorks}
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
            Loading work items...
          </span>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="glass-panel py-16 px-6 flex flex-col items-center justify-center text-center gap-4 max-w-[500px] mx-auto w-full mt-4">
          <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-border text-text-muted">
            <Briefcase size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-text-primary">
              {searchQuery ? 'No Results Found' : 'No Work Items Yet'}
            </h3>
            <p className="text-xs text-text-secondary max-w-[340px]">
              {searchQuery
                ? `We couldn't find any projects matching "${searchQuery}". Try refining your keywords.`
                : 'Add your first portfolio project to display on the website.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="cursor-pointer font-bold text-[11px] uppercase tracking-wider mt-2 py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none transition-all hover:bg-accent-primary-hover"
            >
              Add First Project
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedWorks.map(({ work, images }) => {
              const urls = images.map((img) => img.url);
              const cover = urls[0];

              return (
                <div
                  key={work.id}
                  className="group relative bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-brand-border-hover hover:shadow-xl hover:shadow-accent-primary-glow"
                >
                  <div className="h-44 w-full bg-brand-dark relative overflow-hidden border-b border-brand-border">
                    {cover ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenViewer(urls, 0, work.title)
                        }
                        className="w-full h-full p-0 border-none bg-transparent cursor-pointer block"
                        title="View images"
                      >
                        <img
                          src={cover}
                          alt={work.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60 pointer-events-none" />
                    <span className="absolute bottom-3 left-4 text-[10px] font-semibold bg-brand-dark/80 backdrop-blur border border-brand-border py-1 px-2.5 rounded-md text-text-primary flex items-center gap-1.5 shadow-sm pointer-events-none">
                      <Calendar size={11} className="text-accent-primary" />
                      {formatDate(work.createdAt)}
                    </span>
                    {images.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenViewer(urls, 0, work.title)
                        }
                        className="absolute bottom-3 right-4 text-[10px] font-semibold bg-brand-dark/80 backdrop-blur border border-brand-border py-1 px-2.5 rounded-md text-text-primary flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ImageIcon size={11} className="text-accent-primary" />
                        {images.length}
                      </button>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-brand-border bg-brand-dark/30">
                      {images.map((img, imgIndex) => (
                        <button
                          key={img.key}
                          type="button"
                          onClick={() =>
                            handleOpenViewer(urls, imgIndex, work.title)
                          }
                          className="w-10 h-10 rounded-md overflow-hidden border border-brand-border p-0 cursor-pointer shrink-0 hover:border-accent-primary/50 transition-colors"
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col gap-2.5">
                    <h3 className="font-bold text-text-primary text-[14.5px] leading-snug group-hover:text-accent-primary transition-colors duration-200 line-clamp-1">
                      {work.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 flex-1">
                      {work.description}
                    </p>

                    {(work.projectUrl || work.webAppUrl) && (
                      <div className="flex flex-wrap gap-2">
                        {work.projectUrl && (
                          <a
                            href={work.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-accent-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={11} /> Project
                          </a>
                        )}
                        {work.webAppUrl && (
                          <a
                            href={work.webAppUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-semibold text-accent-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={11} /> Web App
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-brand-border mt-1">
                      <button
                        onClick={() => handleOpenEdit(work)}
                        className="flex-1 cursor-pointer font-semibold text-[11px] py-2 px-3 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleOpenDelete(work)}
                        className="cursor-pointer p-2 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
                        title="Delete Work"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer text-xs py-2 px-3 rounded-md border border-brand-border text-text-secondary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer text-xs py-2 px-3 rounded-md border border-brand-border text-text-secondary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={modalMode === 'create' ? 'Add Work' : 'Edit Work'}
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
              Title
            </label>
            <input
              type="text"
              placeholder="e.g., Logistics Dashboard"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={isSubmitting}
              className={FIELD_INPUT_CLASS}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>
              Description
            </label>
            <textarea
              placeholder="Describe the project, stack, and outcome..."
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isSubmitting}
              rows={4}
              className={`${FIELD_INPUT_CLASS} resize-none`}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={FIELD_LABEL_CLASS}>
                Project URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.projectUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, projectUrl: e.target.value }))
                }
                disabled={isSubmitting}
                className={FIELD_INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={FIELD_LABEL_CLASS}>
                Web App URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.webAppUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, webAppUrl: e.target.value }))
                }
                disabled={isSubmitting}
                className={FIELD_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>
              Images ({totalImageCount}/{MAX_IMAGES})
            </label>

            {(visibleExisting.length > 0 || newPreviews.length > 0) && (
              <div className="grid grid-cols-4 gap-2">
                {visibleExisting.map((img, imgIndex) => (
                  <div
                    key={img.key}
                    className="relative h-16 rounded-md overflow-hidden border border-brand-border bg-brand-dark/40 group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                          handleOpenViewer(
                            formPreviewUrls,
                            imgIndex,
                            form.title || 'Work images'
                          )
                      }
                      className="w-full h-full p-0 border-none bg-transparent cursor-pointer"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(img.key)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-accent-danger text-white border-none cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {newPreviews.map((src, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative h-16 rounded-md overflow-hidden border border-brand-border bg-brand-dark/40 group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenViewer(
                          formPreviewUrls,
                          visibleExisting.length + index,
                          form.title || 'Work images'
                        )
                      }
                      className="w-full h-full p-0 border-none bg-transparent cursor-pointer"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(index)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-accent-danger text-white border-none cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalImageCount < MAX_IMAGES && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-brand-border hover:border-accent-primary/50 bg-brand-dark/20 hover:bg-brand-dark/40 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/jpg,image/png,image/webp,.jpeg,.jpg,.png,.webp"
                  multiple
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="w-9 h-9 rounded-full bg-brand-dark/80 border border-brand-border flex items-center justify-center text-text-muted group-hover:text-accent-primary group-hover:border-accent-primary/25 transition-all">
                  <Upload size={16} />
                </div>
                <div className="flex flex-col items-center text-center px-4">
                  <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                    Click or drag images
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5">
                    JPEG, PNG, WEBP · max 5MB · up to {MAX_IMAGES}
                  </span>
                </div>
              </div>
            )}
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
                'Create Work'
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
                Deleting this project will permanently remove it and its images
                from the website.
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary px-1">
            Are you sure you want to delete{' '}
            <strong className="text-text-primary">
              "{selectedWork?.title}"
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
                'Delete Work'
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
