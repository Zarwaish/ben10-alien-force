import pg from 'pg';

const { Client } = pg;

async function tryJwtPassword(port) {
  console.log(`Trying service_role JWT as password on port ${port}...`);
  const client = new Client({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port,
    user: 'postgres.lmpvugbgdnrerucecgze',
    password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcHZ1Z2JnZG5yZXJ1Y2VjZ3plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg2NTA0OCwiZXhwIjoyMDk0NDQxMDQ4fQ.nPkmnwzOENYNbCY82qO4D3oSYbwYivrfniuarUaGX5s',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Connected using JWT as password on port ${port}!`);
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
    const success = await tryJwtPassword(port);
    if (success) {
      process.exit(0);
    }
  }
  process.exit(1);
}

main();
