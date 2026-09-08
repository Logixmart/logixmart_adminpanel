import { Calendar, Edit3, Mail, Trash2, User } from 'lucide-react';
import type { ClientReview } from '../../../api/clientReviews';
import { formatDate } from '../../../utils/format';

interface ClientReviewCardProps {
  review: ClientReview;
  onEdit: (review: ClientReview) => void;
  onDelete: (review: ClientReview) => void;
}

export function ClientReviewCard({
  review,
  onEdit,
  onDelete,
}: ClientReviewCardProps) {
  return (
    <div className="group relative bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-brand-border-hover hover:shadow-xl hover:shadow-accent-primary-glow">
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary flex-shrink-0">
              <User size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-text-primary text-[14.5px] truncate">
                {review.clientName}
              </h3>
              <span className="text-[11px] text-text-muted truncate">
                {[review.designation, review.companyName]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-brand-dark/80 border border-brand-border py-1 px-2 rounded-md text-text-secondary flex items-center gap-1 flex-shrink-0">
            <Calendar size={11} className="text-accent-primary" />
            {formatDate(review.createdAt)}
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed line-clamp-4 flex-1">
          “{review.message}”
        </p>

        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <Mail size={12} />
          <span className="truncate">{review.email}</span>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-brand-border mt-1">
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="flex-1 cursor-pointer font-semibold text-[11px] py-2 px-3 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Edit3 size={12} /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(review)}
            className="cursor-pointer p-2 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
            title="Delete Review"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientReviewCard;
