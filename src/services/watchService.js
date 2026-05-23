import { supabase } from '../lib/supabase';
import { mockWatches } from './mockWatches';

/**
 * Fetch watches from Supabase.
 * @param {'omnitrix'|'ultimatrix'} type - Device type (or undefined for all).
 * @returns {Promise<Array>} Array of watch objects.
 */
export const getWatches = async (type) => {
  try {
    let query = supabase.from('watches').select('*');
    if (type) {
      // Include watches of the exact type or of type "both"
      query = query.or(`type.eq.${type},type.eq.both`);
    }
    const { data, error } = await query.order('order_index', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching watches:', e);
    // Fallback to mock data if Supabase request fails
    let fallback = mockWatches;
    if (type) {
      fallback = fallback.filter(w => w.type === type || w.type === 'both');
    }
    return fallback;
  }
};
