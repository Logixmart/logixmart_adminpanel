import type { ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  title?: string;
  description: ReactNode;
  warning?: {
    title?: string;
    message: string;
  };
  confirmLabel?: string;
  cancelLabel?: string;
  submittingLabel?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  title = 'Confirm Deletion',
  description,
  warning,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  submittingLabel = 'Deleting...',
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={title}
    >
      <div className={`flex flex-col ${warning ? 'gap-4' : 'gap-5'}`}>
        {warning && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-danger/5 border border-accent-danger/10 text-accent-danger text-xs leading-relaxed">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary">
                {warning.title ?? 'Warning: This action is irreversible!'}
              </span>
              <span>{warning.message}</span>
            </div>
          </div>
        )}

        <div className="text-xs text-text-secondary px-1 leading-relaxed">{description}</div>

        <div className={`flex gap-3 ${warning ? 'pt-2' : ''}`}>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 cursor-pointer font-semibold py-2.5 border-none rounded-lg text-xs bg-accent-danger text-white hover:bg-accent-danger/90 hover:shadow-lg hover:shadow-accent-danger/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                {submittingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-brand-border border border-brand-border text-text-secondary hover:bg-brand-border-hover hover:text-text-primary transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmModal;
