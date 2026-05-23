import pg from 'pg';

const { Client } = pg;

async function trySni(port) {
  console.log(`Trying SNI connection on port ${port}...`);
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port,
    user: 'postgres.lmpvugbgdnrerucecgze',
    password: 'dullgamerz321',
    database: 'postgres',
    ssl: { 
      rejectUnauthorized: false,
      servername: 'db.lmpvugbgdnrerucecgze.supabase.co'
    }
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Connected successfully using SNI on port ${port}!`);
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
  for (const port of [5432, 6543]) {
    const success = await trySni(port);
    if (success) {
      process.exit(0);
    }
  }
  process.exit(1);
}

main();
