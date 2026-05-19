import { supabase } from '../lib/supabase';
import { fallbackAliens } from '../data/fallbackAliens';

let dbSupportsWatchColumns = true;

export const alienService = {
  async getLocalList() {
    const local = localStorage.getItem('local_aliens');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing local_aliens cache:', e);
      }
    }
    // Initialize cache if it doesn't exist
    localStorage.setItem('local_aliens', JSON.stringify(fallbackAliens));
    return fallbackAliens;
  },

  async getAll() {
    try {
      const { data, error } = await supabase
        .from('aliens')
        .select('*');
      
      if (!error && data) {
        if (data.length === 0) {
          // Initialize empty database with fallback aliens
          const { data: inserted, error: insertErr } = await supabase
            .from('aliens')
            .insert(fallbackAliens)
            .select();
            
          if (!insertErr && inserted) {
            localStorage.setItem('local_aliens', JSON.stringify(inserted));
            return inserted;
          }
        }
        
        // Sync to local storage for quick cache
        localStorage.setItem('local_aliens', JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage cache:', err);
    }
    
    return this.getLocalList();
  },

  async getByName(name) {
    try {
      const { data, error } = await supabase
        .from('aliens')
        .select('*')
        .eq('name', name)
        .single();
      
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getByName failed, using local cache:', err);
    }

    const current = await this.getLocalList();
    const found = current.find(a => a.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
    throw new Error('Alien not found');
  },

  async create(alien) {
    if (dbSupportsWatchColumns) {
      try {
        const { data, error } = await supabase
          .from('aliens')
          .insert([alien])
          .select();
        
        if (!error && data && data.length > 0) {
          return data[0];
        } else if (error && (error.code === 'PGRST204' || error.message.includes('order_index') || error.message.includes('watch_type'))) {
          console.warn('Columns watch_type or order_index missing from Supabase, enabling backward compatible insert.');
          dbSupportsWatchColumns = false;
        } else if (error) {
          throw error;
        }
      } catch (err) {
        console.warn('Supabase create failed, testing columns:', err);
      }
    }

    if (!dbSupportsWatchColumns) {
      const { watch_type, order_index, ...stripped } = alien;
      const { data, error } = await supabase
        .from('aliens')
        .insert([stripped])
        .select();
      
      if (!error && data && data.length > 0) {
        // Return full object to client even if DB stripped new columns
        return { ...data[0], watch_type, order_index };
      }
      throw error || new Error('Database insertion failed');
    }

    throw new Error('Database operation failed. Please check backend connection.');
  },

  async update(id, updates) {
    if (dbSupportsWatchColumns) {
      try {
        const { data, error } = await supabase
          .from('aliens')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (!error && data && data.length > 0) {
          return data[0];
        } else if (error && (error.code === 'PGRST204' || error.message.includes('order_index') || error.message.includes('watch_type'))) {
          dbSupportsWatchColumns = false;
        } else if (error) {
          throw error;
        }
      } catch (err) {
        console.warn('Supabase update failed, testing columns:', err);
      }
    }

    if (!dbSupportsWatchColumns) {
      const { watch_type, order_index, ...stripped } = updates;
      const { data, error } = await supabase
        .from('aliens')
        .update(stripped)
        .eq('id', id)
        .select();
      
      if (!error && data && data.length > 0) {
        return { ...data[0], watch_type, order_index };
      }
      throw error || new Error('Database update failed');
    }

    throw new Error('Database operation failed. Please check backend connection.');
  },

  async delete(id) {
    const { error } = await supabase
      .from('aliens')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase delete failed:', error);
      throw error;
    }
  }
};
