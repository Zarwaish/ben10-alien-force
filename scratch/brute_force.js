import pg from 'pg';

const { Client } = pg;

const passwords = [
  'dullgamerz321',
  'dullgamerz123',
  'dullgamerz',
  'dullgamer',
  'dullgamer321',
  'dullgamer123',
  'dullgamerz321!',
  'dullgamerz123!',
  'postgres',
  'admin',
  'admin123',
  'dullgamerz3210'
];

async function tryPassword(password) {
  const client = new Client({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.lmpvugbgdnrerucecgze',
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`SUCCESS: Password is "${password}"`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('password authentication failed')) {
      console.log(`Failed for password: "${password}" (Authentication failed)`);
    } else {
      console.log(`Failed for password: "${password}" (${err.message})`);
    }
    return false;
  }
}

async function main() {
  for (const pw of passwords) {
    const success = await tryPassword(pw);
    if (success) {
      process.exit(0);
    }
  }
  console.log('All passwords failed.');
  process.exit(1);
}

main();
