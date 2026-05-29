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
  'sa-east-1'
];

async function tryDirectHost() {
  const host = 'db.ytdltanztbigryanjoyy.supabase.co';
  console.log(`Trying direct host ${host} on port 5432...`);
  const client = new Client({
    host,
    port: 5432,
    user: 'postgres',
    password: 'dullgamerz321',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`SUCCESS: Connected directly to ${host}!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed for direct host: ${err.message}`);
    return false;
  }
}

async function tryRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying region ${region} (${host})...`);
  
  for (const port of [6543, 5432]) {
    const client = new Client({
      host,
      port,
      user: 'postgres.ytdltanztbigryanjoyy',
      password: 'dullgamerz321',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000
    });
    
    try {
      await client.connect();
      console.log(`SUCCESS: Connected to ${region} on port ${port}!`);
      await client.end();
      return { region, port };
    } catch (err) {
      // also try password with '!' or '0'
      for (const altPassword of ['dullgamerz321!', 'dullgamerz3210']) {
        const clientAlt = new Client({
          host,
          port,
          user: 'postgres.ytdltanztbigryanjoyy',
          password: altPassword,
          database: 'postgres',
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 2000
        });
        try {
          await clientAlt.connect();
          console.log(`SUCCESS: Connected to ${region} on port ${port} with password: ${altPassword}!`);
          await clientAlt.end();
          return { region, port, password: altPassword };
        } catch (e2) {
          // ignore
        }
      }
    }
  }
  return null;
}

async function main() {
  const directSuccess = await tryDirectHost();
  if (directSuccess) {
    console.log('Direct host connection works!');
  }

  for (const region of regions) {
    const res = await tryRegion(region);
    if (res) {
      console.log('FOUND POOLER CONNECTION:', res);
      process.exit(0);
    }
  }
  console.error('All connections failed.');
  process.exit(1);
}

main();
