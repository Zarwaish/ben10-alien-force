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
          // If the file is not an image, resolve with raw data URL
          if (!file.type.startsWith('image/')) {
            resolve(reader.result);
            return;
          }

          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const max_size = 800; // maximum width or height
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.6 quality (reduces size by 90%+)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
            resolve(compressedDataUrl);
          };
          img.onerror = () => {
            // Fallback to raw base64 if loading image fails
            resolve(reader.result);
          };
          img.src = e.target.result;
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
