async function main() {
  const url = 'https://lmpvugbgdnrerucecgze.supabase.co/rest/v1/';
  const anonKey = 'sb_publishable_xGzUSWFUkcYGA0IwIJJjbg_elILikk0';
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    const text = await res.text();
    console.log('Raw response:', text.substring(0, 1000));
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main();
