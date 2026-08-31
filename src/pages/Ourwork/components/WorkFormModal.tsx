import React from 'react';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { WorkImageItem } from '../../../api/work';
import { FIELD_INPUT_CLASS, FIELD_LABEL_CLASS } from '../../../utils/styles';
import { MAX_IMAGES, type WorkFormValues } from '../utils/workHelpers';

interface WorkFormModalProps {
  isOpen: boolean;
  modalMode: 'create' | 'edit';
  form: WorkFormValues;
  formError: string | null;
  isSubmitting: boolean;
  visibleExisting: WorkImageItem[];
  newPreviews: string[];
  formPreviewUrls: string[];
  totalImageCount: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (patch: Partial<WorkFormValues>) => void;
  onOpenViewer: (urls: string[], startIndex: number, title: string) => void;
  onRemoveExisting: (key: string) => void;
  onRemoveNewFile: (index: number) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function WorkFormModal({
  isOpen,
  modalMode,
  form,
  formError,
  isSubmitting,
  visibleExisting,
  newPreviews,
  formPreviewUrls,
  totalImageCount,
  fileInputRef,
  onClose,
  onSubmit,
  onFormChange,
  onOpenViewer,
  onRemoveExisting,
  onRemoveNewFile,
  onImageChange,
  onDrop,
}: WorkFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={modalMode === 'create' ? 'Add Work' : 'Edit Work'}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {formError && (
          <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Title</label>
          <input
            type="text"
            placeholder="e.g., Logistics Dashboard"
            value={form.title}
            onChange={(e) => onFormChange({ title: e.target.value })}
            disabled={isSubmitting}
            className={FIELD_INPUT_CLASS}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Description</label>
          <textarea
            placeholder="Describe the project, stack, and outcome..."
            value={form.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            disabled={isSubmitting}
            rows={4}
            className={`${FIELD_INPUT_CLASS} resize-none`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>Website URL</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={form.websiteUrl}
              onChange={(e) => onFormChange({ websiteUrl: e.target.value })}
              disabled={isSubmitting}
              className={FIELD_INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>App Store URL</label>
            <input
              type="url"
              placeholder="https://apps.apple.com/..."
              value={form.appStoreUrl}
              onChange={(e) => onFormChange({ appStoreUrl: e.target.value })}
              disabled={isSubmitting}
              className={FIELD_INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>Play Store URL</label>
            <input
              type="url"
              placeholder="https://play.google.com/..."
              value={form.playStoreUrl}
              onChange={(e) => onFormChange({ playStoreUrl: e.target.value })}
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
                      onOpenViewer(
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
                    onClick={() => onRemoveExisting(img.key)}
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
                      onOpenViewer(
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
                    onClick={() => onRemoveNewFile(index)}
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
              onDrop={onDrop}
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className="w-full h-28 border-2 border-dashed border-brand-border hover:border-accent-primary/50 bg-brand-dark/20 hover:bg-brand-dark/40 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
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

export default WorkFormModal;
