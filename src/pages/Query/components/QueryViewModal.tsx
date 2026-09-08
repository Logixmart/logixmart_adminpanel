import { Mail } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { ContactSubmission } from '../../../api/contact';
import { formatDateTime } from '../../../utils/format';

interface QueryViewModalProps {
  isOpen: boolean;
  query: ContactSubmission | null;
  onClose: () => void;
  onDelete: () => void;
}

function DetailField({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs text-text-primary font-medium break-all">{value}</span>
    </div>
  );
}

export function QueryViewModal({
  isOpen,
  query,
  onClose,
  onDelete,
}: QueryViewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Query Details">
      {query && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Name" value={query.name} />
            <DetailField label="Email" value={query.email} />
            <DetailField label="Phone" value={query.phone || '—'} />
            <DetailField label="Subject" value={query.subject || '—'} />
            <DetailField
              label="Submitted"
              value={formatDateTime(query.createdAt)}
              className="sm:col-span-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Message
            </span>
            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap bg-brand-dark/40 border border-brand-border rounded-lg p-3">
              {query.message}
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <a
              href={`mailto:${query.email}`}
              className="flex-1 cursor-pointer font-semibold py-2.5 rounded-lg text-xs bg-accent-primary text-white hover:bg-accent-primary-hover flex items-center justify-center gap-2 transition-all no-underline"
            >
              <Mail size={14} /> Reply via Email
            </a>
            <button
              type="button"
              onClick={onDelete}
              className="cursor-pointer font-semibold py-2.5 px-4 rounded-lg text-xs bg-accent-danger/10 border border-accent-danger/20 text-accent-danger hover:bg-accent-danger/20 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default QueryViewModal;
