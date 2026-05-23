import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: '2406:da1a:82a:9d01:30ef:9f32:1e68:ca40',
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
    console.error('Error details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);
  }
}

main();
