import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'db.lmpvugbgdnrerucecgze.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'dullgamerz321',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT current_user;');
    console.log('Current user:', res.rows);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

main();
