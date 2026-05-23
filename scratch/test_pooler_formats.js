import pg from 'pg';

const { Client } = pg;

const configs = [
  {
    desc: "User: postgres, DB: postgres",
    user: 'postgres',
    database: 'postgres'
  },
  {
    desc: "User: postgres, DB: lmpvugbgdnrerucecgze",
    user: 'postgres',
    database: 'lmpvugbgdnrerucecgze'
  },
  {
    desc: "User: postgres, DB: postgres.lmpvugbgdnrerucecgze",
    user: 'postgres',
    database: 'postgres.lmpvugbgdnrerucecgze'
  },
  {
    desc: "User: postgres.lmpvugbgdnrerucecgze, DB: postgres",
    user: 'postgres.lmpvugbgdnrerucecgze',
    database: 'postgres'
  },
  {
    desc: "User: postgres.lmpvugbgdnrerucecgze, DB: lmpvugbgdnrerucecgze",
    user: 'postgres.lmpvugbgdnrerucecgze',
    database: 'lmpvugbgdnrerucecgze'
  }
];

async function tryConfig(config, port) {
  console.log(`Trying format: ${config.desc} on port ${port}...`);
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port,
    user: config.user,
    password: 'dullgamerz321',
    database: config.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Connected successfully!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed: ${err.message}`);
    return false;
  }
}

async function main() {
  for (const config of configs) {
    for (const port of [5432, 6543]) {
      const success = await tryConfig(config, port);
      if (success) {
        console.log('FOUND WORKING CONFIG:', config, 'port:', port);
        process.exit(0);
      }
    }
  }
  console.log('All formats failed.');
}

main();
