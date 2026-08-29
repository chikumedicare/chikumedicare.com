const https = require('https');

const loginData = JSON.stringify({
  userId: 'admin',
  password: 'admin' // Or whatever default password is used
});

const req = https.request({
  hostname: 'backend.ravishankar-clinic.workers.dev',
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Login Response:', body);
    try {
      const data = JSON.parse(body);
      if (data.token) {
        fetchData(data.token, 'users');
        fetchData(data.token, 'beats');
      }
    } catch(e){}
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(loginData);
req.end();

function fetchData(token, collection) {
  const req2 = https.request({
    hostname: 'backend.ravishankar-clinic.workers.dev',
    path: `/api/data/${collection}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res2) => {
    let body2 = '';
    res2.on('data', d => body2 += d);
    res2.on('end', () => {
      console.log(`Fetch ${collection} Response (${res2.statusCode}):`, body2);
    });
  });
  req2.end();
}
