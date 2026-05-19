import { useState, useEffect } from 'react';
import { alienService } from '../services/alienService';
import { toast } from 'react-hot-toast';
import { fallbackAliens } from '../data/fallbackAliens';

export function useAliens() {
  const [aliens, setAliens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAliens = async () => {
    try {
      setLoading(true);
      const data = await alienService.getAll();
      const enriched = data.map(dbAlien => {
        const fallback = fallbackAliens.find(f => 
          f.name.toLowerCase() === dbAlien.name.toLowerCase() || 
          String(f.id) === String(dbAlien.id)
        );
        return {
          ...dbAlien,
          gallery: fallback 
            ? [dbAlien.image_url || dbAlien.img, ...fallback.gallery.slice(1)]
            : (dbAlien.gallery || [dbAlien.image_url || dbAlien.img])
        };
      });
      setAliens(enriched);
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
  }, []);

  const addAlien = async (newAlien) => {
    try {
      const added = await alienService.create(newAlien);
      setAliens([...aliens, added]);
      toast.success('Alien added successfully');
      return added;
    } catch (err) {
      toast.error('Failed to add alien');
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
      toast.error('Failed to update alien');
      throw err;
    }
  };

  const deleteAlien = async (id) => {
    try {
      await alienService.delete(id);
      setAliens(aliens.filter(a => a.id !== id));
      toast.success('Alien removed from archive');
    } catch (err) {
      toast.error('Failed to delete alien');
      throw err;
    }
  };

  return { aliens, loading, error, refresh: fetchAliens, addAlien, updateAlien, deleteAlien };
}
