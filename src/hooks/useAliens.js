import { useState, useEffect } from 'react';
import { alienService } from '../services/alienService';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export function useAliens() {
  const [aliens, setAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAliens = async () => {
    try {
      setLoading(true);
      const data = await alienService.getAll();
      setAliens(data);
    } catch (err) {
      console.error('Error fetching aliens:', err);
      setError(err.message);
      toast.error('Failed to load alien database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAliens();

    // Setup Supabase Realtime Subscription for Global Syncing
    const channel = supabase
      .channel('public:aliens')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aliens' }, (payload) => {
        fetchAliens(); // Re-fetch the updated list
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addAlien = async (newAlien) => {
    try {
      const added = await alienService.create(newAlien);
      setAliens([...aliens, added]);
      toast.success('Alien added successfully');
      return added;
    } catch (err) {
      throw err;
    }
  };

  const updateAlien = async (id, updates) => {
    try {
      const updated = await alienService.update(id, updates);
      setAliens(aliens.map(a => a.id === id ? updated : a));
      toast.success('Alien updated successfully');
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteAlien = async (id) => {
    try {
      await alienService.delete(id);
      setAliens(aliens.filter(a => a.id !== id));
      toast.success('Alien removed from archive');
    } catch (err) {
      throw err;
    }
  };

  return { aliens, loading, error, refresh: fetchAliens, addAlien, updateAlien, deleteAlien };
}
