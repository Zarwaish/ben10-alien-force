import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../hooks/useAuth.jsx';
import { alienService } from '../services/alienService';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export function useAliens() {
  const [aliens, setAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schemaStatus, setSchemaStatus] = useState({ hasWatchColumns: true, hasGalleryColumn: true });

  const fetchAliens = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await alienService.getAll();
      setAliens(data);
      setSchemaStatus(alienService.getSchemaStatus());
    } catch (err) {
      console.error('Error fetching aliens:', err);
      setError(err.message);
      toast.error('Failed to load alien database');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const { loading: authLoading } = useContext(AuthContext);

  // Fetch aliens after auth is ready
  useEffect(() => {
    if (!authLoading) {
      fetchAliens();
    }
  }, [authLoading]);

  // Subscribe to real‑time updates on "aliens" table (once on mount)
  useEffect(() => {
    let channel;
    try {
      if (supabase && typeof supabase.channel === 'function') {
        channel = supabase
          .channel('public:aliens-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'aliens' }, () => {
            // Re‑fetch silently to update UI across clients
            fetchAliens(true);
          })
          .subscribe();
      }
    } catch (err) {
      console.warn('Realtime aliens subscription failed:', err);
    }
    return () => {
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
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

  return { aliens, loading, error, schemaStatus, refresh: fetchAliens, addAlien, updateAlien, deleteAlien };
}
