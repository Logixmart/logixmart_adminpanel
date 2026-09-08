import type { Work, WorkImageItem } from '../../../api/work';
import { getWorkImageItems } from '../../../api/work';
import { formatDate } from '../../../utils/format';

export const PAGE_SIZE = 12;
export const MAX_IMAGES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
export const projectCategories = [
  'Web Development',
  'App Development',
  'UI/UX Design',
  'Digital Marketing',
  'Branding',
];
export const emptyForm = {
  title: '',
  description: '',
  websiteUrl: '',
  appStoreUrl: '',
  playStoreUrl: '',
  category: '',
};

export type WorkFormValues = typeof emptyForm;

export interface WorkWithImages {
  work: Work;
  images: WorkImageItem[];
}

export function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function pickValidImages(
  files: File[],
  currentCount: number
): { accepted: File[]; error?: string } {
  const accepted: File[] = [];
  let error: string | undefined;

  for (const file of files) {
    if (currentCount + accepted.length >= MAX_IMAGES) {
      error = `You can upload a maximum of ${MAX_IMAGES} images.`;
      break;
    }
    if (file.size > MAX_FILE_SIZE) {
      error = 'Each image must be less than 5MB.';
      continue;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      error = 'Only JPEG, JPG, PNG, or WEBP images are allowed.';
      continue;
    }
    accepted.push(file);
  }

  return { accepted, error };
}

export function validateWorkForm(form: WorkFormValues): string | null {
  const title = form.title.trim();
  const description = form.description.trim();
  const websiteUrl = form.websiteUrl.trim();
  const appStoreUrl = form.appStoreUrl.trim();
  const playStoreUrl = form.playStoreUrl.trim();

  if (!title) return 'Title is required.';
  if (!description) return 'Description is required.';
  if (!isValidUrl(websiteUrl)) {
    return 'Website URL must be a valid http(s) link.';
  }
  if (!isValidUrl(appStoreUrl)) {
    return 'App Store URL must be a valid http(s) link.';
  }
  if (!isValidUrl(playStoreUrl)) {
    return 'Play Store URL must be a valid http(s) link.';
  }
  return null;
}

export function buildWorkFormData(
  form: WorkFormValues,
  newFiles: File[],
  modalMode: 'create' | 'edit',
  removedImageKeys: string[]
): FormData {
  const formData = new FormData();
  formData.append('title', form.title.trim());
  formData.append('category', form.category.trim());
  formData.append('description', form.description.trim());
  formData.append('websiteUrl', form.websiteUrl.trim());
  formData.append('appStoreUrl', form.appStoreUrl.trim());
  formData.append('playStoreUrl', form.playStoreUrl.trim());
  newFiles.forEach((file) => formData.append('images', file));

  if (modalMode === 'edit' && removedImageKeys.length > 0) {
    formData.append('removeImages', JSON.stringify(removedImageKeys));
  }
  return formData;
}

export function mapWorksWithImages(works: Work[]): WorkWithImages[] {
  return works.map((work) => ({
    work,
    images: getWorkImageItems(work),
  }));
}

export function filterWorks(
  items: WorkWithImages[],
  searchQuery: string
): WorkWithImages[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return items;
  return items.filter(
    ({ work }) =>
      work.title.toLowerCase().includes(query) ||
      work.description.toLowerCase().includes(query)
  );
}

export function paginateWorks<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  return {
    totalPages,
    currentPage,
    paged: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  };
}

export function getLatestUpdateLabel(works: Work[]): string {
  if (works.length === 0) return 'No updates';
  const latestWork = [...works].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  })[0];
  return formatDate(latestWork.updatedAt || latestWork.createdAt);
}

export function countWorksWithImages(items: WorkWithImages[]): number {
  return items.filter(({ images }) => images.length > 0).length;
}
