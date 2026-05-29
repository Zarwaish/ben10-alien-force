// native fetch used

async function main() {
  const url = 'https://ytdltanztbigryanjoyy.supabase.co/rest/v1/';
  const anonKey = 'sb_publishable_Vb-Wjw0Q1nMn6vMDeFsTMw_Z2mPZe16';

  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const data = await res.json();
    console.log('Exposed paths/RPCs:');
    Object.keys(data.paths || {}).forEach(path => {
      console.log(`- ${path}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
