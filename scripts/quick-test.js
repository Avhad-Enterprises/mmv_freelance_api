#!/usr/bin/env node

// Quick login test
const http = require('http');

function testLogin(testData, description) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-test-mode': 'true'
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`${description}: Status ${res.statusCode}`);
        console.log(`Response: ${data}`);
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', (error) => {
      console.error(`${description}: Error - ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runQuickTests() {
  console.log('🔍 Quick Login Tests');
  console.log('===================');
  
  try {
    await testLogin({ email: 'test@example.com', password: 'password123' }, 'Valid Email Test');
    await testLogin({ password: 'password123' }, 'Missing Email Test');
    await testLogin({ email: 'test@example.com', password: '123' }, 'Short Password Test');
    
    console.log('\n✅ All quick tests completed!');
  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

runQuickTests();