import pg from 'pg';

const { Client } = pg;

const extraRegions = [
  'eu-north-1',
  'me-central-1',
  'ap-northeast-3',
  'af-south-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
];

async function main() {
  console.log('Scanning extra/missing regions...');
  for (const region of extraRegions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Trying ${region}...`);
    const client = new Client({
      host,
      port: 6543,
      user: 'postgres.ytdltanztbigryanjoyy',
      password: 'dullgamerz321',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000
    });

    try {
      await client.connect();
      console.log(`\nSUCCESS: Connected to ${region}!`);
      await client.end();
      return;
    } catch (err) {
      console.log(`${region}: [${err.code || 'NO_CODE'}] ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  console.log('Extra scan completed.');
}

main();
