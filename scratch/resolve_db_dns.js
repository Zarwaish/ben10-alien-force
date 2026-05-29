import dns from 'dns';

function resolveHost(host) {
  console.log(`Resolving DNS for ${host}...`);
  dns.resolve4(host, (err, addresses) => {
    if (err) {
      console.log(`${host} (IPv4): Failed: ${err.message}`);
    } else {
      console.log(`${host} (IPv4):`, addresses);
    }
  });

  dns.resolve6(host, (err, addresses) => {
    if (err) {
      console.log(`${host} (IPv6): Failed: ${err.message}`);
    } else {
      console.log(`${host} (IPv6):`, addresses);
    }
  });
}

resolveHost('db.ytdltanztbigryanjoyy.supabase.co');
resolveHost('ytdltanztbigryanjoyy.supabase.co');
