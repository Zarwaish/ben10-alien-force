// src/services/adminService.js

import { supabase } from '../lib/supabase';
import { storageService } from './storageService';

/** Helper to check if current user is admin */
export async function isCurrentUserAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return false;
  
  if (session?.user?.email === 'admin@gmail.com') return true;

  // Check admin_users table for admin flag
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', session.user.id)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Admin check error:', error);
    return false;
  }
  return !!data;
}

// ALIEN CRUD
export const adminAlienService = {
  async list(type = null) {
    let query = supabase.from('aliens').select('*');
    if (type) query = query.eq('watch_type', type);
    const { data, error } = await query.order('order_index', { ascending: true });
    if (error) throw error;
    return data;
  },
  async get(id) {
    const { data, error } = await supabase.from('aliens').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  /** Build a safe payload, omitting columns that may not exist yet */
  _buildPayload(alien, imageUrl, galleryArr, ultimateImageUrl, ultimateGalleryArr, includeNewColumns) {
    const base = {
      name: alien.name,
      description: alien.description || '',
      power: alien.power || '',
      type: alien.type || 'Classic',
      watch_type: alien.watch_type || 'omnitrix',
      image_url: imageUrl,
      order_index: Number(alien.order_index) || 0,
      species: alien.species || '',
      planet: alien.planet || '',
    };
    if (includeNewColumns) {
      base.ultimate_image_url = ultimateImageUrl ?? null;
      base.gallery = Array.isArray(galleryArr) ? galleryArr : [];
      // Store all ultimate images as a JSON array in ultimate_gallery column
      // (falls back gracefully if column doesn't exist — schema mismatch handler catches it)
      base.ultimate_gallery = Array.isArray(ultimateGalleryArr) ? ultimateGalleryArr : [];
    }
    return base;
  },

  /** Returns true if the error is a missing-column schema error */
  _isSchemaMismatch(error) {
    return (
      error?.code === 'PGRST204' ||
      error?.message?.includes('gallery') ||
      error?.message?.includes('ultimate_image_url') ||
      error?.message?.includes('ultimate_gallery')
    );
  },

  async create(alien, imageFile, galleryFiles = [], ultimateFiles = []) {
    // 1. Upload primary image
    let imageUrl = alien.image_url || null;
    if (imageFile) {
      imageUrl = await storageService.uploadImage(imageFile, 'alien-images');
    }

    // 2. Upload all ultimate form images
    const ultimateFilesArr = Array.isArray(ultimateFiles) ? ultimateFiles : (ultimateFiles ? [ultimateFiles] : []);
    const uploadedUltimateUrls = [];
    for (const file of ultimateFilesArr) {
      const url = await storageService.uploadImage(file, 'alien-images');
      uploadedUltimateUrls.push(url);
    }
    // Keep first uploaded URL as the primary ultimate_image_url for backward compat
    const ultimateImageUrl = uploadedUltimateUrls[0] || alien.ultimate_image_url || null;
    const ultimateGallery = uploadedUltimateUrls.length > 0 ? uploadedUltimateUrls : (alien.ultimate_image_url ? [alien.ultimate_image_url] : []);

    // 3. Upload gallery files
    const uploadedGalleryUrls = [];
    for (const file of (galleryFiles || [])) {
      const url = await storageService.uploadImage(file, 'alien-images');
      uploadedGalleryUrls.push(url);
    }

    // Build gallery: primary image + extras
    const gallery = imageUrl ? [imageUrl, ...uploadedGalleryUrls] : [...uploadedGalleryUrls];

    // 4. Try insert with all columns
    let payload = this._buildPayload(alien, imageUrl, gallery, ultimateImageUrl, ultimateGallery, true);
    let { data, error } = await supabase.from('aliens').insert([payload]).select();

    // 5. If schema mismatch on ultimate_gallery, retry without it
    if (error && error?.message?.includes('ultimate_gallery')) {
      console.warn('[adminAlienService.create] ultimate_gallery column missing — retrying without it');
      delete payload.ultimate_gallery;
      ({ data, error } = await supabase.from('aliens').insert([payload]).select());
    }

    // 6. If still schema mismatch, retry without gallery/ultimate columns
    if (error && this._isSchemaMismatch(error)) {
      console.warn('[adminAlienService.create] Schema mismatch — retrying without gallery/ultimate_image_url');
      payload = this._buildPayload(alien, imageUrl, null, null, null, false);
      ({ data, error } = await supabase.from('aliens').insert([payload]).select());
    }

    if (error) throw error;
    return data[0];
  },

  async update(id, updates, imageFile, newGalleryFiles = [], ultimateFiles = []) {
    // 1. Upload primary image if changed
    let imageUrl = updates.image_url;
    if (imageFile) {
      imageUrl = await storageService.uploadImage(imageFile, 'alien-images');
    }

    // 2. Upload all new ultimate images
    const ultimateFilesArr = Array.isArray(ultimateFiles) ? ultimateFiles : (ultimateFiles ? [ultimateFiles] : []);
    const uploadedUltimateUrls = [];
    for (const file of ultimateFilesArr) {
      const url = await storageService.uploadImage(file, 'alien-images');
      uploadedUltimateUrls.push(url);
    }
    // Merge new ultimate uploads with existing ultimate_gallery
    const existingUltimateGallery = Array.isArray(updates.ultimate_gallery) ? updates.ultimate_gallery : (updates.ultimate_image_url ? [updates.ultimate_image_url] : []);
    const finalUltimateGallery = [...existingUltimateGallery, ...uploadedUltimateUrls];
    const ultimateImageUrl = uploadedUltimateUrls[0] || updates.ultimate_image_url || null;

    // 3. Upload new gallery files and append to existing
    const uploadedGalleryUrls = [];
    for (const file of (newGalleryFiles || [])) {
      const url = await storageService.uploadImage(file, 'alien-images');
      uploadedGalleryUrls.push(url);
    }
    const existingGallery = Array.isArray(updates.gallery) ? updates.gallery : [];
    const finalGallery = [...existingGallery, ...uploadedGalleryUrls];

    // 4. Try update with all columns
    let payload = this._buildPayload(updates, imageUrl, finalGallery, ultimateImageUrl, finalUltimateGallery, true);
    let { data, error } = await supabase.from('aliens').update(payload).eq('id', id).select();

    // 5. If schema mismatch on ultimate_gallery, retry without it
    if (error && error?.message?.includes('ultimate_gallery')) {
      console.warn('[adminAlienService.update] ultimate_gallery column missing — retrying without it');
      delete payload.ultimate_gallery;
      ({ data, error } = await supabase.from('aliens').update(payload).eq('id', id).select());
    }

    // 6. If still schema mismatch, retry without gallery/ultimate columns
    if (error && this._isSchemaMismatch(error)) {
      console.warn('[adminAlienService.update] Schema mismatch — retrying without gallery/ultimate_image_url');
      payload = this._buildPayload(updates, imageUrl, null, null, null, false);
      ({ data, error } = await supabase.from('aliens').update(payload).eq('id', id).select());
    }

    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase.from('aliens').delete().eq('id', id);
    if (error) throw error;
  }
};

/** TRANSFORMATION CRUD */
export const adminTransformationService = {
  async list(alienId = null) {
    let query = supabase.from('transformations').select('*');
    if (alienId) query = query.eq('alien_id', alienId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async create(transformation, imageFile) {
    let imageUrl = transformation.image_url || null;
    if (imageFile) {
      imageUrl = await storageService.uploadImage(imageFile, 'transformation-images');
    }
    const payload = { 
      alien_id: transformation.alien_id,
      name: transformation.name || 'Transformation',
      description: transformation.description || '',
      image_url: imageUrl
    };
    const { data, error } = await supabase.from('transformations').insert([payload]).select();
    if (error) throw error;
    return data[0];
  },
  async update(id, updates, imageFile) {
    let imageUrl = updates.image_url;
    if (imageFile) {
      imageUrl = await storageService.uploadImage(imageFile, 'transformation-images');
    }
    const payload = { 
      alien_id: updates.alien_id,
      name: updates.name || 'Transformation',
      description: updates.description,
      image_url: imageUrl
    };
    const { data, error } = await supabase.from('transformations').update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  async delete(id) {
    const { error } = await supabase.from('transformations').delete().eq('id', id);
    if (error) throw error;
  }
};
