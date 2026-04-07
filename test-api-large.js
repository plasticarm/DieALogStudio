import http from 'http';

// Create a 60MB string
const largeString = 'a'.repeat(60 * 1024 * 1024);

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/game/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:', data.substring(0, 200));
  });
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({ hostUser: { id: '123', name: 'test' }, avatarPool: [largeString] }));
req.end();
