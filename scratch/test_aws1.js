import pg from 'pg';

const { Client } = pg;

async function tryAws1(port) {
  console.log(`Trying aws-1-ap-south-1 on port ${port}...`);
  const client = new Client({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port,
    user: 'postgres.lmpvugbgdnrerucecgze',
    password: 'dullgamerz321',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Connected to aws-1-ap-south-1 on port ${port}!`);
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
    const success = await tryAws1(port);
    if (success) {
      process.exit(0);
    }
  }
  process.exit(1);
}

main();
