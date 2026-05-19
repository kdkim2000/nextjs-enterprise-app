import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const uploadFile = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string = 'general'
): Promise<{ path: string; publicUrl: string }> => {
  const ext = originalName.split('.').pop() || '';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  return { path: data.path, publicUrl };
};

export const deleteFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from('uploads').remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
};

export default { uploadFile, deleteFile };
