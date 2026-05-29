import dns from 'dns';

async function main() {
  const url = 'ytdltanztbigryanjoyy.supabase.co';
  console.log('Resolving DNS for:', url);
  dns.resolve4(url, (err, addresses) => {
    if (err) {
      console.error('DNS Resolve Error:', err);
    } else {
      console.log('IP Addresses:', addresses);
    }
  });

  try {
    const res = await fetch(`https://${url}/rest/v1/`, {
      headers: {
        'apikey': 'sb_publishable_Vb-Wjw0Q1nMn6vMDeFsTMw_Z2mPZe16'
      }
    });
    console.log('Fetch Status:', res.status);
    console.log('Headers:', [...res.headers.entries()]);
  } catch (err) {
    console.error('Fetch Error:', err.message);
  }
}

main();
