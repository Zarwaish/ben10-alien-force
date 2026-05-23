import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'db.lmpvugbgdnrerucecgze.supabase.co',
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
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'aliens';
    `);
    console.log('Columns in aliens table:');
    res.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    await client.end();
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main();
