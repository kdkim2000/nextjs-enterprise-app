const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('Testing authentication...\n');

    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'john.doe',
      password: 'Password123!'
    });

    const { token, refreshToken, user } = loginResponse.data;
    console.log('✓ Login successful');
    console.log('User:', user.username);
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('');

    // Test accessing /user/recent-menus with the token
    console.log('2. Testing /user/recent-menus endpoint...');
    try {
      const menusResponse = await axios.get(`${API_BASE_URL}/user/recent-menus`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✓ Recent menus request successful');
      console.log('Menus:', menusResponse.data.menus || []);
    } catch (error) {
      console.log('✗ Recent menus request failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }
    console.log('');

    // Test accessing /user/favorite-menus
    console.log('3. Testing /user/favorite-menus endpoint...');
    try {
      const favResponse = await axios.get(`${API_BASE_URL}/user/favorite-menus`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✓ Favorite menus request successful');
      console.log('Menus:', favResponse.data.menus || []);
    } catch (error) {
      console.log('✗ Favorite menus request failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }
    console.log('');

    // Test accessing /menu/user-menus
    console.log('4. Testing /menu/user-menus endpoint...');
    try {
      const userMenusResponse = await axios.get(`${API_BASE_URL}/menu/user-menus`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✓ User menus request successful');
      console.log('Menu count:', userMenusResponse.data.menus?.length || 0);
    } catch (error) {
      console.log('✗ User menus request failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAuth();
