import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const STORAGE_BUCKET =
  (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined) ||
  'user-images';

export type UploadFolder = 'blogs' | 'our-works';

export const UPLOAD_FOLDERS: UploadFolder[] = ['blogs', 'our-works'];

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase storage is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  if (!client) {
    client = createClient(supabaseUrl, supabasePublishableKey);
  }
  return client;
}

export function isStorageObjectPath(path: string): boolean {
  return UPLOAD_FOLDERS.some((folder) => path.startsWith(`${folder}/`));
}

export function getStoragePublicUrl(path: string): string {
  if (!isSupabaseConfigured()) return '';
  return getSupabase().storage.from(STORAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
