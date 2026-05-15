import { supabase } from '../lib/supabase';
import { fallbackAliens } from '../data/fallbackAliens';

export const alienService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('aliens')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error || !data || data.length === 0) {
        console.log('Using fallback alien data');
        return fallbackAliens;
      }
      return data;
    } catch (err) {
      console.warn('Supabase fetch failed, using fallback data:', err);
      return fallbackAliens;
    }
  },


  async getByName(name) {
    const { data, error } = await supabase
      .from('aliens')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(alien) {
    const { data, error } = await supabase
      .from('aliens')
      .insert([alien])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('aliens')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('aliens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
