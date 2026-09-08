import React from 'react';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { FIELD_INPUT_CLASS, FIELD_LABEL_CLASS } from '../../../utils/styles';
import type { BlogFormValues } from '../utils/blogHelpers';

interface BlogFormModalProps {
  isOpen: boolean;
  modalMode: 'create' | 'edit';
  form: BlogFormValues;
  formError: string | null;
  isSubmitting: boolean;
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (patch: Partial<BlogFormValues>) => void;
  onRemoveImage: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function BlogFormModal({
  isOpen,
  modalMode,
  form,
  formError,
  isSubmitting,
  imagePreview,
  fileInputRef,
  onClose,
  onSubmit,
  onFormChange,
  onRemoveImage,
  onImageChange,
  onDrop,
}: BlogFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={modalMode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post Details'}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {formError && (
          <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Article Title</label>
          <input
            type="text"
            placeholder="e.g., Implementing Secure Web Sockets in Production"
            value={form.title}
            onChange={(e) => onFormChange({ title: e.target.value })}
            disabled={isSubmitting}
            className={FIELD_INPUT_CLASS}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Description / Body Content</label>
          <textarea
            placeholder="Describe the main focus and takeaways of this article..."
            value={form.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            disabled={isSubmitting}
            rows={4}
            className={`${FIELD_INPUT_CLASS} resize-none`}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Featured Image (optional)</label>

          {imagePreview ? (
            <div className="relative w-full h-44 rounded-lg overflow-hidden border border-brand-border bg-brand-dark/40 group">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={onRemoveImage}
                  disabled={isSubmitting}
                  className="p-2 rounded-full bg-accent-danger text-white border-none cursor-pointer flex items-center justify-center hover:bg-accent-danger/80 hover:scale-105 transition-all shadow-md disabled:opacity-50"
                  title="Remove Image"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className="w-full h-44 border-2 border-dashed border-brand-border hover:border-accent-primary/50 bg-brand-dark/20 hover:bg-brand-dark/40 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                accept="image/jpeg,image/jpg,image/png,image/webp,.jpeg,.jpg,.png,.webp"
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
                  JPEG, JPG, PNG, or WEBP (Max 5MB) — optional
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
                {modalMode === 'create' ? 'Creating Article...' : 'Saving Changes...'}
              </>
            ) : modalMode === 'create' ? (
              'Create Article'
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BlogFormModal;
