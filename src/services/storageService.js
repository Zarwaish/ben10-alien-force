import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadImage(file, path) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const uploadPromise = supabase.storage
        .from('alien-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // 10-second timeout to prevent indefinite hanging on network issues
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ error: new Error('Upload timeout') }), 10000)
      );

      const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('alien-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('[Supabase Storage Upload Error]', err);
      console.warn(
        'Supabase storage upload failed. Falling back to local base64. \n' +
        'IMPORTANT: To fix this permanently, make sure the "alien-assets" storage bucket exists and ' +
        'the storage RLS policies from "supabase_updates.sql" are run in your Supabase Dashboard SQL Editor.'
      );
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error('Failed to read file locally'));
        reader.readAsDataURL(file);
      });
    }
  },

  async deleteImage(url) {
    try {
      if (!url || url.startsWith('data:')) return;
      const pathParts = url.split('/alien-assets/');
      if (pathParts.length < 2) return;
      
      const filePath = pathParts[1];
      await supabase.storage
        .from('alien-assets')
        .remove([filePath]);
    } catch (err) {
      console.warn('Storage deleteImage failed (ignored):', err);
    }
  }
};
