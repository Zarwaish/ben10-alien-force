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
  'sa-east-1',
  'eu-north-1'
];

async function tryRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying ${region} (${host}) with SNI servername...`);
  
  for (const port of [6543, 5432]) {
    const client = new Client({
      host,
      port,
      user: 'postgres.ytdltanztbigryanjoyy',
      password: 'dullgamerz321',
      database: 'postgres',
      ssl: { 
        rejectUnauthorized: false,
        servername: 'db.ytdltanztbigryanjoyy.supabase.co'
      },
      connectionTimeoutMillis: 5000
    });
    
    try {
      await client.connect();
      console.log(`SUCCESS: Connected to ${region} on port ${port}!`);
      const res = await client.query('SELECT current_user;');
      console.log('User:', res.rows);
      await client.end();
      return { region, port };
    } catch (err) {
      console.log(`Failed on port ${port}: ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  return null;
}

async function main() {
  for (const region of regions) {
    const res = await tryRegion(region);
    if (res) {
      console.log('FOUND CORRECT CONNECTION:', res);
      process.exit(0);
    }
  }
  console.error('All regions failed with SNI.');
  process.exit(1);
}

main();
