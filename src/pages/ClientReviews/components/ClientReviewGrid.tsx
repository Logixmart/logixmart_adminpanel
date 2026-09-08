import type { ClientReview } from '../../../api/clientReviews';
import { ClientReviewCard } from './ClientReviewCard';

interface ClientReviewGridProps {
  reviews: ClientReview[];
  onEdit: (review: ClientReview) => void;
  onDelete: (review: ClientReview) => void;
}

export function ClientReviewGrid({
  reviews,
  onEdit,
  onDelete,
}: ClientReviewGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ClientReviewCard
          key={review.id}
          review={review}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default ClientReviewGrid;
