async function main() {
  const url = 'https://lmpvugbgdnrerucecgze.supabase.co/rest/v1/';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcHZ1Z2JnZG5yZXJ1Y2VjZ3plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg2NTA0OCwiZXhwIjoyMDk0NDQxMDQ4fQ.nPkmnwzOENYNbCY82qO4D3oSYbwYivrfniuarUaGX5s';
  
  try {
    console.log('Fetching OpenAPI spec using service_role key...');
    const res = await fetch(url, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    const data = await res.json();
    console.log('Exposed paths (tables and functions):');
    Object.keys(data.paths).forEach(path => {
      console.log(`- ${path}`);
    });
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main();
