import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve('d:/ben10-alien-force/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ytdltanztbigryanjoyy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Vb-Wjw0Q1nMn6vMDeFsTMw_Z2mPZe16';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('--- Probing Database Schema ---');
  console.log('Supabase URL:', supabaseUrl);

  // Probe aliens table columns
  try {
    const { data, error } = await supabase.from('aliens').select('*').limit(1);
    if (error) {
      console.error('Error selecting from aliens table:', error);
    } else {
      console.log('Aliens table accessed successfully.');
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      console.log('Sample alien data keys (columns):', columns);
      
      const required = ['gallery', 'ultimate_image_url', 'species', 'planet'];
      for (const col of required) {
        const exists = data.length > 0 ? col in data[0] : null;
        console.log(`Column "${col}": ${exists === null ? 'unknown (no rows returned to check keys)' : exists ? 'EXISTS' : 'MISSING'}`);
      }
    }
  } catch (err) {
    console.error('Exception probing aliens table:', err);
  }

  // Probe storage bucket
  console.log('\n--- Probing Storage Bucket ---');
  try {
    // We can list files in the alien-assets bucket or try to list buckets if we have access (or just download a dummy file)
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('alien-assets');
    if (bucketError) {
      console.error('Error fetching alien-assets bucket:', bucketError);
    } else {
      console.log('alien-assets bucket found:', bucketData);
    }

    // Try listing files
    const { data: filesData, error: filesError } = await supabase.storage.from('alien-assets').list('', { limit: 5 });
    if (filesError) {
      console.error('Error listing files in alien-assets:', filesError);
    } else {
      console.log('Successfully listed files in alien-assets. File count/info:', filesData.length);
    }
  } catch (err) {
    console.error('Exception probing storage bucket:', err);
  }
}

checkDatabase();
