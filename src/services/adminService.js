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
  async create(alien, imageFile, galleryFiles = [], ultimateFile = null) {
    let imageUrl = alien.image_url || null;
    if (imageFile) {
      imageUrl = await storageService.uploadImage(imageFile, 'alien-images');
    }
    
    // Upload ultimate form image
    let ultimateImageUrl = alien.ultimate_image_url || null;
    if (ultimateFile) {
      ultimateImageUrl = await storageService.uploadImage(ultimateFile, 'alien-images');
    }

    // Upload gallery files
    const uploadedGalleryUrls = [];
    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const url = await storageService.uploadImage(file, 'alien-images');
        uploadedGalleryUrls.push(url);
      }
    }

    // Base gallery array starts with the primary image_url if provided, plus any uploaded gallery files
    const initialGallery = imageUrl ? [imageUrl] : [];
    const gallery = [...initialGallery, ...uploadedGalleryUrls];

    const payload = { 
      name: alien.name,
      description: alien.description || '',
      power: alien.power || '',
      type: alien.type || 'Classic',
      watch_type: alien.watch_type || 'omnitrix',
      image_url: imageUrl,
      ultimate_image_url: ultimateImageUrl,
      gallery: gallery,
      order_index: Number(alien.order_index) || 0,
      species: alien.species || '',
      planet: alien.planet || ''
    };
    const { data, error } = await supabase.from('aliens').insert([payload]).select();
    if (error) throw error;
    return data[0];
  },
  async update(id, updates, imageFile, newGalleryFiles = [], ultimateFile = null) {
    let imageUrl = updates.image_url;
    if (imageFile) {
      imageUrl = await storageService.uploadImage(imageFile, 'alien-images');
    }

    let ultimateImageUrl = updates.ultimate_image_url;
    if (ultimateFile) {
      ultimateImageUrl = await storageService.uploadImage(ultimateFile, 'alien-images');
    }

    // Upload any new gallery files
    const uploadedGalleryUrls = [];
    if (newGalleryFiles && newGalleryFiles.length > 0) {
      for (const file of newGalleryFiles) {
        const url = await storageService.uploadImage(file, 'alien-images');
        uploadedGalleryUrls.push(url);
      }
    }

    // Append new uploaded URLs to the existing gallery array
    const existingGallery = Array.isArray(updates.gallery) ? updates.gallery : [];
    const finalGallery = [...existingGallery, ...uploadedGalleryUrls];

    const payload = { 
      name: updates.name,
      description: updates.description || '',
      power: updates.power || '',
      type: updates.type || 'Classic',
      watch_type: updates.watch_type || 'omnitrix',
      image_url: imageUrl,
      ultimate_image_url: ultimateImageUrl,
      gallery: finalGallery,
      order_index: Number(updates.order_index) || 0,
      species: updates.species || '',
      planet: updates.planet || ''
    };
    const { data, error } = await supabase.from('aliens').update(payload).eq('id', id).select();
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
