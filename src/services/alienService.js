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
      
      if (!error && data && data.length > 0) {
        // Sync to local storage
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
    const localAlien = {
      ...alien,
      id: alien.id || Date.now().toString(),
      created_at: new Date().toISOString()
    };

    if (dbSupportsWatchColumns) {
      try {
        const { data, error } = await supabase
          .from('aliens')
          .insert([alien])
          .select();
        
        if (!error && data && data.length > 0) {
          const current = await this.getLocalList();
          current.push(data[0]);
          localStorage.setItem('local_aliens', JSON.stringify(current));
          return data[0];
        } else if (error && (error.code === 'PGRST204' || error.message.includes('order_index') || error.message.includes('watch_type'))) {
          console.warn('Columns watch_type or order_index missing from Supabase, enabling local fallback.');
          dbSupportsWatchColumns = false;
        } else if (error) {
          throw error;
        }
      } catch (err) {
        console.warn('Supabase create failed, testing columns:', err);
      }
    }

    if (!dbSupportsWatchColumns) {
      try {
        const { watch_type, order_index, ...stripped } = alien;
        const { data, error } = await supabase
          .from('aliens')
          .insert([stripped])
          .select();
        
        if (!error && data && data.length > 0) {
          const saved = { ...data[0], watch_type, order_index };
          const current = await this.getLocalList();
          current.push(saved);
          localStorage.setItem('local_aliens', JSON.stringify(current));
          return saved;
        }
      } catch (err) {
        console.warn('Supabase fallback create failed:', err);
      }
    }

    // fallback save locally
    const current = await this.getLocalList();
    current.push(localAlien);
    localStorage.setItem('local_aliens', JSON.stringify(current));
    return localAlien;
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
          const current = await this.getLocalList();
          const idx = current.findIndex(a => String(a.id) === String(id));
          if (idx !== -1) {
            current[idx] = { ...current[idx], ...data[0] };
            localStorage.setItem('local_aliens', JSON.stringify(current));
          }
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
      try {
        const { watch_type, order_index, ...stripped } = updates;
        const { data, error } = await supabase
          .from('aliens')
          .update(stripped)
          .eq('id', id)
          .select();
        
        if (!error && data && data.length > 0) {
          const saved = { ...data[0], watch_type, order_index };
          const current = await this.getLocalList();
          const idx = current.findIndex(a => String(a.id) === String(id));
          if (idx !== -1) {
            current[idx] = { ...current[idx], ...saved };
            localStorage.setItem('local_aliens', JSON.stringify(current));
          }
          return saved;
        }
      } catch (err) {
        console.warn('Supabase fallback update failed:', err);
      }
    }

    // fallback update locally
    const current = await this.getLocalList();
    const idx = current.findIndex(a => String(a.id) === String(id));
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem('local_aliens', JSON.stringify(current));
      return current[idx];
    }
    throw new Error('Alien not found');
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('aliens')
        .delete()
        .eq('id', id);
      
      if (!error) {
        const current = await this.getLocalList();
        const filtered = current.filter(a => String(a.id) !== String(id));
        localStorage.setItem('local_aliens', JSON.stringify(filtered));
        return;
      }
    } catch (err) {
      console.warn('Supabase delete failed, deleting from local cache:', err);
    }

    // fallback delete locally
    const current = await this.getLocalList();
    const filtered = current.filter(a => String(a.id) !== String(id));
    localStorage.setItem('local_aliens', JSON.stringify(filtered));
  }
};
