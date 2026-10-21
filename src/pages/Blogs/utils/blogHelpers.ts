import type { Blog } from '../../../api/blogs';
import { formatDate } from '../../../utils/format';
import {
  countWords,
  countWordsFromHtml,
  htmlToPlainText,
  isEmptyHtml,
} from '../../../utils/html';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_DESCRIPTION_WORDS = 500;
export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export type BlogSortBy = 'newest' | 'oldest' | 'title';

export const emptyForm = {
  title: '',
  description: '',
};

export type BlogFormValues = typeof emptyForm;

/** Keeps at most `maxWords` words; preserves trailing space while typing. */
export function limitWords(value: string, maxWords = MAX_DESCRIPTION_WORDS): string {
  const endsWithSpace = /\s$/.test(value);
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  const limited = words.slice(0, maxWords).join(' ');
  return endsWithSpace ? `${limited} ` : limited;
}

/**
 * Paste into `value` at the selection, keeping only words that fit under `maxWords`.
 * Extra pasted words are dropped.
 */
export function pasteWithinWordLimit(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  pastedText: string,
  maxWords = MAX_DESCRIPTION_WORDS
): string {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const wordsBefore = countWords(before);
  const wordsAfter = countWords(after);
  const remaining = Math.max(0, maxWords - wordsBefore - wordsAfter);

  if (remaining === 0) {
    return `${before}${after}`.replace(/\s{2,}/g, ' ');
  }

  const pastedWords = pastedText.trim().split(/\s+/).filter(Boolean);
  const allowedPaste = pastedWords.slice(0, remaining).join(' ');
  if (!allowedPaste) return `${before}${after}`;

  const needsLeadingSpace =
    before.length > 0 && !/\s$/.test(before) && !/^\s/.test(allowedPaste);
  const needsTrailingSpace =
    after.length > 0 && !/^\s/.test(after) && !/\s$/.test(allowedPaste);

  return (
    before +
    (needsLeadingSpace ? ' ' : '') +
    allowedPaste +
    (needsTrailingSpace ? ' ' : '') +
    after
  );
}

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'Image file size must be less than 5MB.';
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, JPG, PNG, or WEBP images are allowed.';
  }
  return null;
}

export function validateBlogForm(form: BlogFormValues): string | null {
  if (!form.title.trim()) return 'Title is required.';
  if (isEmptyHtml(form.description)) return 'Description is required.';
  if (countWordsFromHtml(form.description) > MAX_DESCRIPTION_WORDS) {
    return `Description must be ${MAX_DESCRIPTION_WORDS} words or fewer.`;
  }
  return null;
}

export function buildBlogFormData(
  form: BlogFormValues,
  imagePath: string | null,
  isImageRemoved: boolean // Add a flag tracking if user deleted the existing photo
): FormData {
  const formData = new FormData();
  formData.append('title', form.title.trim());
  formData.append('description', sanitizeHtml(form.description));

  if (imagePath) {
    formData.append('imageUrl', imagePath);
  } else if (isImageRemoved) {
    formData.append('removeImage', 'true'); // Flag sent to backend
  }

  return formData;
}

export function filterBlogs(blogs: Blog[], searchQuery: string): Blog[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return blogs;
  return blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(query) ||
      htmlToPlainText(blog.description).toLowerCase().includes(query)
  );
}

export function sortBlogs(blogs: Blog[], sortBy: BlogSortBy): Blog[] {
  return [...blogs].sort((a, b) => {
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
}

export function getLatestUpdateLabel(blogs: Blog[]): string {
  if (blogs.length === 0) return 'No updates';
  const latest = [...blogs].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
  return formatDate(latest.updatedAt);
}

export function countBlogsWithImages(blogs: Blog[]): number {
  return blogs.filter((blog) => blog.imageUrl).length;
}
