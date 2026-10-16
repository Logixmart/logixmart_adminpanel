import { getSupabase, type UploadFolder } from '../config/supabase';
import { getSignedUploadUrl } from '../api/storage';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export interface UploadedImage {
  path: string;
  publicUrl: string;
}

const uploadCache = new WeakMap<File, Promise<UploadedImage>>();

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG, JPEG, PNG and WEBP images are allowed.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

export function uploadImage(
  file: File,
  folder: UploadFolder
): Promise<UploadedImage> {
  const cached = uploadCache.get(file);
  if (cached) return cached;

  const task = (async () => {
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const signed = await getSignedUploadUrl({
      folder,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });

    if (!signed.success || !('data' in signed) || !signed.data) {
      throw new Error(
        signed.message || 'Failed to prepare image upload. Please try again.'
      );
    }

    const { bucket, path, token } = signed.data;
    const supabase = getSupabase();

    const { data, error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file, { contentType: file.type });

    if (error) {
      throw new Error(
        error.message || 'Failed to upload image. Please try again.'
      );
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: publicData.publicUrl,
    };
  })();

  uploadCache.set(file, task);
  task.catch(() => uploadCache.delete(file));
  return task;
}

export function uploadImages(
  files: File[],
  folder: UploadFolder
): Promise<UploadedImage[]> {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}
