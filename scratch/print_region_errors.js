import pg from 'pg';

const { Client } = pg;

async function testConnection() {
  // Let's test a couple of likely regions:
  // Since zarwaish is likely in Pakistan (time offset is +05:00), the region might be ap-south-1 (Mumbai), ap-southeast-1 (Singapore), or eu-central-1 (Frankfurt).
  const candidateRegions = ['ap-south-1', 'ap-southeast-1', 'eu-central-1', 'us-east-1'];

  for (const region of candidateRegions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`\nTesting pooler in region ${region} (${host}):`);
    
    // We try port 6543 (transaction pooling) and 5432 (session pooling)
    for (const port of [6543, 5432]) {
      const client = new Client({
        host,
        port,
        user: 'postgres.ytdltanztbigryanjoyy',
        password: 'dullgamerz321',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });

      try {
        await client.connect();
        console.log(`SUCCESS connected to ${region} on port ${port}!`);
        await client.end();
        return;
      } catch (err) {
        console.log(`Failed on port ${port} with error: [${err.code || 'NO_CODE'}] ${err.message}`);
      }
    }
  }
}

testConnection();
