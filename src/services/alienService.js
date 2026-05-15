import { supabase } from '../lib/supabase';

export const alienService = {
  async getAll() {
    const { data, error } = await supabase
      .from('aliens')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
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
