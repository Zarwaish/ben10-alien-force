import { supabase } from '../lib/supabase';

// Runtime flags — probed once on first write
let _hasWatchColumns = null;   // null = unknown, true/false = confirmed
let _hasGalleryColumn = null;

async function probeColumns() {
  if (_hasWatchColumns !== null) return; // already probed
  try {
    const { data, error } = await supabase.from('aliens').select('watch_type, order_index, gallery').limit(1);
    if (error) {
      // PGRST204 means columns missing; other errors = table issue
      _hasWatchColumns = false;
      _hasGalleryColumn = false;
    } else {
      _hasWatchColumns = true;
      _hasGalleryColumn = true;
    }
  } catch {
    _hasWatchColumns = false;
    _hasGalleryColumn = false;
  }
}

function buildPayload(alien) {
  // Only include columns the DB actually has
  const base = {
    name:        alien.name        || '',
    description: alien.description || '',
    power:       alien.power       || '',
    image_url:   alien.image_url   || '',
    type:        alien.type        || 'Classic',
  };

  if (_hasGalleryColumn) {
    base.gallery = Array.isArray(alien.gallery) ? alien.gallery : [];
  }
  if (_hasWatchColumns) {
    base.watch_type   = alien.watch_type   || 'omnitrix';
    base.order_index  = Number(alien.order_index) || 0;
  }
  return base;
}

async function throwFriendly(error, op) {
  const code = error?.code;
  const msg  = error?.message || '';

  if (code === '42501') {
    throw new Error(
      `Permission denied: Supabase RLS is blocking ${op}. ` +
      `Run the SQL in supabase_updates.sql in your Supabase Dashboard → SQL Editor to fix this.`
    );
  }
  if (code === 'PGRST204' || msg.includes('watch_type') || msg.includes('order_index') || msg.includes('gallery')) {
    throw new Error(
      `Schema mismatch: column missing from 'aliens' table. ` +
      `Run the ALTER TABLE statements in supabase_updates.sql in your Supabase Dashboard.`
    );
  }
  if (code === '23502') {
    throw new Error(`Null constraint violation: a required field is empty. Details: ${msg}`);
  }
  if (code === '23505') {
    throw new Error(`Duplicate alien: an alien with this name or ID already exists.`);
  }
  if (code === '22P02') {
    throw new Error(`Invalid UUID format. Do not manually set the ID field.`);
  }
  throw new Error(`${op} failed [${code}]: ${msg}`);
}

export const alienService = {
  async getAll() {
    await probeColumns();
    const query = supabase.from('aliens').select('*');
    if (_hasWatchColumns) {
      query.order('order_index', { ascending: true, nullsFirst: false });
    }
    const { data, error } = await query;

    if (error) {
      console.error('[alienService.getAll]', error);
      await throwFriendly(error, 'getAll');
    }
    return data || [];
  },

  async getByName(name) {
    const { data, error } = await supabase
      .from('aliens')
      .select('*')
      .ilike('name', name)
      .maybeSingle();   // maybeSingle won't throw if 0 rows

    if (error) {
      console.error('[alienService.getByName]', error);
      await throwFriendly(error, 'getByName');
    }
    if (!data) throw new Error(`Alien "${name}" not found in database.`);
    return data;
  },

  async create(alien) {
    await probeColumns();
    const payload = buildPayload(alien);

    console.info('[alienService.create] payload:', payload);

    const { data, error } = await supabase
      .from('aliens')
      .insert([payload])
      .select();

    if (error) {
      console.error('[alienService.create] Supabase error:', error);

      // If unknown columns, reset probe and retry without them
      if (error.code === 'PGRST204' || error.message?.includes('watch_type') || error.message?.includes('order_index') || error.message?.includes('gallery')) {
        _hasWatchColumns = false;
        _hasGalleryColumn = false;
        const stripped = buildPayload(alien);
        const { data: d2, error: e2 } = await supabase.from('aliens').insert([stripped]).select();
        if (e2) {
          console.error('[alienService.create] Fallback insert error:', e2);
          await throwFriendly(e2, 'create (fallback)');
        }
        return { ...d2[0], watch_type: alien.watch_type, order_index: alien.order_index };
      }

      await throwFriendly(error, 'create');
    }

    return data[0];
  },

  async update(id, updates) {
    await probeColumns();
    const payload = buildPayload(updates);

    console.info('[alienService.update] id:', id, 'payload:', payload);

    const { data, error } = await supabase
      .from('aliens')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[alienService.update] Supabase error:', error);

      if (error.code === 'PGRST204' || error.message?.includes('watch_type') || error.message?.includes('order_index') || error.message?.includes('gallery')) {
        _hasWatchColumns = false;
        _hasGalleryColumn = false;
        const stripped = buildPayload(updates);
        const { data: d2, error: e2 } = await supabase.from('aliens').update(stripped).eq('id', id).select();
        if (e2) {
          console.error('[alienService.update] Fallback update error:', e2);
          await throwFriendly(e2, 'update (fallback)');
        }
        return { ...d2[0], watch_type: updates.watch_type, order_index: updates.order_index };
      }

      await throwFriendly(error, 'update');
    }

    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('aliens')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[alienService.delete] Supabase error:', error);
      await throwFriendly(error, 'delete');
    }
  }
};
