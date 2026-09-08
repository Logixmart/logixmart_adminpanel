import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { FIELD_INPUT_CLASS, FIELD_LABEL_CLASS } from '../../../utils/styles';
import type { ClientReviewFormValues } from '../utils/clientReviewHelpers';

interface ClientReviewFormModalProps {
  isOpen: boolean;
  modalMode: 'create' | 'edit';
  form: ClientReviewFormValues;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (patch: Partial<ClientReviewFormValues>) => void;
}

export function ClientReviewFormModal({
  isOpen,
  modalMode,
  form,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onFormChange,
}: ClientReviewFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={modalMode === 'create' ? 'Add Client Review' : 'Edit Client Review'}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {formError && (
          <div className="bg-accent-danger/10 border border-accent-danger/20 text-accent-danger p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Client Name</label>
          <input
            type="text"
            placeholder="e.g., Jane Smith"
            value={form.clientName}
            onChange={(e) => onFormChange({ clientName: e.target.value })}
            disabled={isSubmitting}
            className={FIELD_INPUT_CLASS}
            required
            maxLength={10}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>Company (optional)</label>
            <input
              type="text"
              placeholder="e.g., Acme Corp"
              value={form.companyName}
              onChange={(e) => onFormChange({ companyName: e.target.value })}
              disabled={isSubmitting}
              className={FIELD_INPUT_CLASS}
              maxLength={25}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL_CLASS}>Designation (optional)</label>
            <input
              type="text"
              placeholder="e.g., CTO"
              value={form.designation}
              onChange={(e) => onFormChange({ designation: e.target.value })}
              disabled={isSubmitting}
              className={FIELD_INPUT_CLASS}
              maxLength={25}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Email</label>
          <input
            type="email"
            placeholder="client@company.com"
            value={form.email}
            onChange={(e) => onFormChange({ email: e.target.value })}
            disabled={isSubmitting}
            className={FIELD_INPUT_CLASS}
            required
            maxLength={20}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL_CLASS}>Review Message</label>
          <textarea
            placeholder="Write the client testimonial..."
            value={form.message}
            onChange={(e) => onFormChange({ message: e.target.value })}
            disabled={isSubmitting}
            rows={4}
            className={`${FIELD_INPUT_CLASS} resize-none`}
            required
            maxLength={300}
          />
          <p className="text-xs text-text-muted">{form.message.length} / 300</p>
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
              'Create Review'
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

export default ClientReviewFormModal;
