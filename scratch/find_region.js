import fs from 'fs';

async function main() {
  const targetIp = '2406:da1a:82a:9d01:30ef:9f32:1e68:ca40';
  console.log('Fetching AWS IP ranges...');
  try {
    const res = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
    const data = await res.json();
    console.log('Searching in', data.ipv6_prefixes.length, 'IPv6 prefixes...');
    
    // We will do a simple prefix matching
    // targetIp is 2406:da1a:82a:9d01:30ef:9f32:1e68:ca40
    // let's match the first 4 segments: 2406:da1a:082a::/48 or similar
    // AWS prefixes are like "2406:da1a:800::/40"
    
    // Convert IPv6 to binary or hex string representation for robust matching
    // segment representation:
    // 2406:da1a:82a:9d01...
    // Let's print prefixes starting with 2406:da1a:
    const matches = data.ipv6_prefixes.filter(p => p.ipv6_prefix.startsWith('2406:da1a:'));
    console.log('Matching prefixes starting with 2406:da1a:');
    matches.forEach(m => {
      console.log(`- Prefix: ${m.ipv6_prefix}, Region: ${m.region}, Service: ${m.service}`);
    });
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main();
