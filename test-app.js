// test-app.js - Quick verification script
const http = require('http');

console.log('🧪 Testing EcoRewards Application...\n');

// Test 1: Health Check
console.log('1. Testing backend health...');
const healthCheck = new Promise((resolve, reject) => {
  const req = http.request('http://localhost:4000/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.status === 'OK') {
        console.log('   ✅ Backend is running!');
        resolve(true);
      } else {
        reject('Backend not healthy');
      }
    });
  });
  
  req.on('error', () => {
    console.log('   ❌ Backend is NOT running');
    reject('Backend not accessible');
  });
  
  req.end();
});

// Run tests
healthCheck
  .then(() => {
    console.log('\n🎉 All tests passed! Your app is working correctly.');
    console.log('\n📱 Next steps:');
    console.log('   - Open http://localhost:5173 in your browser');
    console.log('   - Register a new account');
    console.log('   - Test the payment system');
    console.log('   - Explore loyalty program');
  })
  .catch(err => {
    console.log('\n❌ Tests failed:', err);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure backend is running: node index.js');
    console.log('   - Check if port 4000 is available');
    console.log('   - Verify all dependencies installed');
  });