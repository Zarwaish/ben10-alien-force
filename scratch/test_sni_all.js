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

async function tryRegionSni(region, port) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying region ${region} (${host}) on port ${port}...`);
  const client = new Client({
    host,
    port,
    user: 'postgres.lmpvugbgdnrerucecgze',
    password: 'dullgamerz321',
    database: 'postgres',
    ssl: { 
      rejectUnauthorized: false,
      servername: 'db.lmpvugbgdnrerucecgze.supabase.co'
    },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`SUCCESS: Connected to ${region} on port ${port}!`);
    const res = await client.query('SELECT current_user;');
    console.log('Current user:', res.rows);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed: ${err.message}`);
    return false;
  }
}

async function main() {
  for (const region of regions) {
    for (const port of [5432, 6543]) {
      const success = await tryRegionSni(region, port);
      if (success) {
        console.log(`FOUND WORKING CONNECTION: region=${region}, port=${port}`);
        process.exit(0);
      }
    }
  }
  console.log('All regions failed.');
  process.exit(1);
}

main();
