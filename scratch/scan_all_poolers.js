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

async function main() {
  console.log('Starting scan of all poolers (indices 0 to 3, all regions)...');
  
  for (const index of [0, 1, 2, 3]) {
    for (const region of regions) {
      const host = `aws-${index}-${region}.pooler.supabase.com`;
      
      const client = new Client({
        host,
        port: 6543,
        user: 'postgres.ytdltanztbigryanjoyy',
        password: 'dullgamerz321',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 2000 // 2 seconds timeout for fast scanning
      });

      try {
        await client.connect();
        console.log(`\nSUCCESS: Connected to ${host}!`);
        await client.end();
        return;
      } catch (err) {
        const msg = err.message || '';
        // If the pooler actually recognizes the tenant, we'll get "password authentication failed" or SUCCESS
        if (!msg.includes('tenant') && !msg.includes('Tenant') && !msg.includes('not found') && !msg.includes('ENOTFOUND')) {
          console.log(`\nFOUND CORRECT POOLER HOST: ${host}`);
          console.log(`Error returned: ${msg}`);
          await client.end().catch(() => {});
          return;
        }
      }
    }
  }
  console.log('\nScan completed. No matching pooler found.');
}

main();
