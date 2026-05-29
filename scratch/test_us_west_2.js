import pg from 'pg';

const { Client } = pg;

async function testHost(port, password) {
  const host = 'aws-0-us-west-2.pooler.supabase.com';
  console.log(`Connecting to ${host} on port ${port} with password "${password}"...`);
  
  const client = new Client({
    host,
    port,
    user: 'postgres.ytdltanztbigryanjoyy',
    password,
    database: 'postgres',
    ssl: { 
      rejectUnauthorized: false,
      servername: 'db.ytdltanztbigryanjoyy.supabase.co'
    },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log(`SUCCESS: Connected to ${host} on port ${port} with password "${password}"!`);
    
    // Test a query
    const res = await client.query('SELECT current_database();');
    console.log('Query output:', res.rows);
    
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed on port ${port} with password "${password}": ${err.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  const passwords = ['dullgamerz321', 'dullgamerz321!', 'dullgamerz3210'];
  const ports = [6543, 5432];

  for (const port of ports) {
    for (const password of passwords) {
      const ok = await testHost(port, password);
      if (ok) {
        process.exit(0);
      }
    }
  }
  console.error('All variations failed.');
  process.exit(1);
}

main();
