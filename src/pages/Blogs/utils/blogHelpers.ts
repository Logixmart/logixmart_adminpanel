import type { Blog } from '../../../api/blogs';
import { formatDate } from '../../../utils/format';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
  if (!form.description.trim()) return 'Description is required.';
  return null;
}

// export function buildBlogFormData(
//   form: BlogFormValues,
//   imageFile: File | null
// ): FormData {
//   const formData = new FormData();
//   formData.append('title', form.title.trim());
//   formData.append('description', form.description.trim());
//   if (imageFile) {
//     formData.append('image', imageFile);
//   }
//   return formData;
// }
export function buildBlogFormData(
  form: BlogFormValues,
  imageFile: File | null,
  isImageRemoved: boolean // Add a flag tracking if user deleted the existing photo
): FormData {
  const formData = new FormData();
  formData.append('title', form.title.trim());
  formData.append('description', form.description.trim());

  if (imageFile) {
    formData.append('image', imageFile);
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
      blog.description.toLowerCase().includes(query)
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
