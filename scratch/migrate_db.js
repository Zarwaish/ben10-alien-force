import pg from 'pg';

const { Client } = pg;

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'ca-central-1',
  'sa-east-1'
];

async function tryRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying region ${region} (${host})...`);
  
  // Try port 6543 first, then 5432
  for (const port of [6543, 5432]) {
    const client = new Client({
      host,
      port,
      user: 'postgres.lmpvugbgdnrerucecgze',
      password: 'dullgamerz321',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    
    try {
      await client.connect();
      console.log(`SUCCESS: Connected to ${region} on port ${port}!`);
      
      // Check current columns of 'aliens' table
      const colCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'aliens';
      `);
      console.log('Current columns:', colCheck.rows.map(r => r.column_name));
      
      // Perform alterations
      console.log('Altering table: adding columns if missing...');
      await client.query(`
        ALTER TABLE aliens ADD COLUMN IF NOT EXISTS species text;
        ALTER TABLE aliens ADD COLUMN IF NOT EXISTS planet text;
        ALTER TABLE aliens ADD COLUMN IF NOT EXISTS abilities text[];
        ALTER TABLE aliens ADD COLUMN IF NOT EXISTS watch_category text;
        ALTER TABLE aliens ADD COLUMN IF NOT EXISTS order_index integer default 0;
        ALTER TABLE aliens ADD COLUMN IF NOT EXISTS description text;
        ALTER TABLE aliens ADD COLUMN IF NOT EXISTS image_url text;
      `);
      
      console.log('Schema update complete!');
      
      // Verify final columns
      const finalCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'aliens';
      `);
      console.log('Updated columns:', finalCheck.rows.map(r => r.column_name));
      
      // Refresh Supabase schema cache
      console.log('Refreshing schema cache...');
      await client.query(`NOTIFY pgrst, 'reload schema';`);
      console.log('Schema cache reload notified!');
      
      await client.end();
      return true;
    } catch (err) {
      console.log(`Failed for ${region} on port ${port}: ${err.message}`);
    }
  }
  return false;
}

async function main() {
  for (const region of regions) {
    const success = await tryRegion(region);
    if (success) {
      console.log('MIGRATION FULLY COMPLETED.');
      process.exit(0);
    }
  }
  console.error('All regions failed.');
  process.exit(1);
}

main();
