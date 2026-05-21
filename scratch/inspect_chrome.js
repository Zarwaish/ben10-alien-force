import http from 'http';

http.get('http://127.0.0.1:59340/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Targets:', JSON.stringify(JSON.parse(data), null, 2));
  });
}).on('error', (err) => {
  console.error('Error fetching DevTools json:', err);
});
