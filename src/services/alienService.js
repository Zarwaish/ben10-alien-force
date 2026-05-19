import { supabase } from '../lib/supabase';

let dbSupportsWatchColumns = true;

export const alienService = {
  async getAll() {
    const { data, error } = await supabase
      .from('aliens')
      .select('*')
      .order('order_index', { ascending: true, nullsFirst: false });
    
    if (error) {
      console.error('Failed to fetch from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  async getByName(name) {
    const { data, error } = await supabase
      .from('aliens')
      .select('*')
      .ilike('name', name)
      .single();
    
    if (error) {
      console.error('Failed to fetch alien by name:', error);
      throw error;
    }
    return data;
  },

  async create(alien) {
    // Let Supabase auto-generate the UUID if not provided
    const payload = {
      ...alien,
      created_at: new Date().toISOString()
    };
    if (alien.id) payload.id = alien.id;

    if (dbSupportsWatchColumns) {
      try {
        const { data, error } = await supabase
          .from('aliens')
          .insert([payload])
          .select();
        
        if (!error && data && data.length > 0) {
          return data[0];
        } else if (error && (error.code === 'PGRST204' || error.message?.includes('order_index') || error.message?.includes('watch_type'))) {
          console.warn('Columns watch_type or order_index missing from Supabase, enabling backward compatible insert.');
          dbSupportsWatchColumns = false;
        } else if (error) {
          throw error;
        }
      } catch (err) {
        if (dbSupportsWatchColumns) {
           console.error('Supabase create failed:', err);
           throw err;
        }
      }
    }

    if (!dbSupportsWatchColumns) {
      const { watch_type, order_index, ...stripped } = payload;
      const { data, error } = await supabase
        .from('aliens')
        .insert([stripped])
        .select();
      
      if (!error && data && data.length > 0) {
        return { ...data[0], watch_type, order_index };
      }
      console.error('Supabase fallback create failed:', error);
      throw error || new Error(error?.message || 'Database insertion failed');
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
        } else if (error && (error.code === 'PGRST204' || error.message?.includes('order_index') || error.message?.includes('watch_type'))) {
          console.warn('Columns watch_type or order_index missing from Supabase, enabling backward compatible update.');
          dbSupportsWatchColumns = false;
        } else if (error) {
          throw error;
        }
      } catch (err) {
        if (dbSupportsWatchColumns) {
           console.error('Supabase update failed:', err);
           throw err;
        }
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
      console.error('Supabase fallback update failed:', error);
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
