const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testMenuByPath() {
  try {
    console.log('Testing /menu/by-path endpoint...\n');

    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'john.doe',
      password: 'Password123!'
    });

    const { token } = loginResponse.data;
    console.log('✓ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('');

    // Test accessing /menu/by-path with different paths
    const testPaths = [
      '/en',
      '/en/dashboard',
      '/en/settings',
      '/en/user-management'
    ];

    for (const path of testPaths) {
      console.log(`2. Testing path: ${path}`);
      try {
        const response = await axios.get(`${API_BASE_URL}/menu/by-path`, {
          params: { path },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✓ Request successful');
        console.log('Menu:', response.data.menu?.name || 'null');
        console.log('');
      } catch (error) {
        console.log('✗ Request failed');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
        console.log('');
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testMenuByPath();
