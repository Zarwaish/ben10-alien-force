import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadImage(file, path) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('alien-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload Error Details:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('alien-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteImage(url) {
    // Extract path from public URL
    // Public URL format: https://.../storage/v1/object/public/alien-assets/aliens/filename.png
    const pathParts = url.split('/alien-assets/');
    if (pathParts.length < 2) return;
    
    const filePath = pathParts[1];
    const { error } = await supabase.storage
      .from('alien-assets')
      .remove([filePath]);

    if (error) throw error;
  }
};
