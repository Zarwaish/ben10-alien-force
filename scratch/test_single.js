import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.lmpvugbgdnrerucecgze',
  password: 'dullgamerz321',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully!');
    await client.end();
  } catch (err) {
    console.error('Error details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);
  }
}

main();
