import type { ClientReview } from '../../../api/clientReviews';
import { formatDate } from '../../../utils/format';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emptyForm = {
  clientName: '',
  companyName: '',
  email: '',
  designation: '',
  message: '',
};

export type ClientReviewFormValues = typeof emptyForm;

export function validateClientReviewForm(
  form: ClientReviewFormValues
): string | null {
  const clientName = form.clientName.trim();
  const email = form.email.trim().toLowerCase();
  const message = form.message.trim();

  if (!clientName) return 'Client name is required.';
  if (!email) return 'Email is required.';
  if (!EMAIL_REGEX.test(email)) {
    return 'Please provide a valid email address.';
  }
  if (!message) return 'Message is required.';
  return null;
}

export function buildClientReviewPayload(form: ClientReviewFormValues) {
  return {
    clientName: form.clientName.trim(),
    email: form.email.trim().toLowerCase(),
    message: form.message.trim(),
    companyName: form.companyName.trim(),
    designation: form.designation.trim(),
  };
}

export function countUniqueCompanies(reviews: ClientReview[]): number {
  return new Set(
    reviews
      .map((r) => r.companyName?.trim())
      .filter((name): name is string => Boolean(name))
  ).size;
}

export function getLatestReviewUpdate(reviews: ClientReview[]): string {
  if (reviews.length === 0) return 'No updates';
  const latest = [...reviews].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
  return formatDate(latest.updatedAt);
}

export function toFormValues(review: ClientReview): ClientReviewFormValues {
  return {
    clientName: review.clientName,
    companyName: review.companyName || '',
    email: review.email,
    designation: review.designation || '',
    message: review.message,
  };
}
