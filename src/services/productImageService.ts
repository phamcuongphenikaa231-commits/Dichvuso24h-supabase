// src/services/productImageService.ts
import { createClient } from '@/lib/supabase/client';

const BUCKET = 'site-assets';
const FOLDER = 'products/';
const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/** Upload ảnh sản phẩm lên Supabase Storage.
 *  Trả về public URL và storage path.
 */
export async function uploadProductImage(file: File): Promise<{ url: string; path: string }> {
  if (file.size > MAX_SIZE) {
    throw new Error('Kích thước ảnh tối đa 3 MB');
  }
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !ALLOWED_EXT.includes(fileExt) || !ALLOWED_MIME.includes(file.type)) {
    throw new Error('Định dạng không được hỗ trợ. Chỉ chấp nhận JPG, PNG hoặc WebP');
  }

  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${FOLDER}${fileName}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    upsert: false,
    cacheControl: '3600',
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return { url: data.publicUrl, path: filePath };
}

/** Xóa ảnh khỏi Supabase Storage theo path. */
export async function deleteProductImage(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

/** Lấy public URL từ storage path. */
export function getProductImageUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
