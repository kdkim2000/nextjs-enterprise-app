/**
 * Board System API Test Script
 * Tests all board-related endpoints
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';
let testBoardTypeId = '';
let testPostId = '';
let testCommentId = '';

// Test data
const testBoardType = {
  code: 'TEST-BOARD-' + Date.now(),
  name: {
    en: 'Test Board',
    ko: '테스트 게시판'
  },
  type: 'normal',
  settings: {
    allowComments: true,
    allowAttachments: true,
    allowLikes: true,
    requireApproval: false,
    maxAttachments: 5,
    maxAttachmentSize: 10485760
  },
  writeRoles: ['admin', 'manager', 'user'],
  readRoles: ['admin', 'manager', 'user', 'guest'],
  status: 'active'
};

const testPost = {
  title: 'Test Post Title',
  content: '<p>This is a test post content with <strong>rich text</strong></p>',
  tags: ['test', 'sample'],
  isSecret: false
};

const testComment = {
  content: 'This is a test comment'
};

// Helper function to make authenticated requests
async function apiRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    };
    if (data) {
      config.data = data;
    }
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testLogin() {
  console.log('\n📝 Testing Login...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '<TEST_PASSWORD>'
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testCreateBoardType() {
  console.log('\n📝 Testing Create Board Type...');
  const result = await apiRequest('POST', '/board-type', testBoardType);
  if (result.success) {
    testBoardTypeId = result.data.boardType?.id || result.data.id;
    console.log('✅ Board type created');
    console.log(`   ID: ${testBoardTypeId}`);
    console.log(`   Code: ${result.data.boardType?.code || result.data.code}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testGetBoardTypes() {
  console.log('\n📝 Testing Get Board Types...');
  const result = await apiRequest('GET', '/board-type');
  if (result.success) {
    console.log('✅ Board types fetched');
    console.log(`   Total: ${result.data.pagination?.totalCount || 0}`);
    console.log(`   Items: ${result.data.boardTypes?.length || 0}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testGetBoardTypeById() {
  console.log('\n📝 Testing Get Board Type by ID...');
  const result = await apiRequest('GET', `/board-type/${testBoardTypeId}`);
  if (result.success) {
    console.log('✅ Board type fetched');
    console.log(`   Name: ${result.data.boardType?.name?.en || 'N/A'}`);
    console.log(`   Type: ${result.data.boardType?.type || 'N/A'}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testCreatePost() {
  console.log('\n📝 Testing Create Post...');
  const postData = { ...testPost, boardTypeId: testBoardTypeId };
  const result = await apiRequest('POST', '/post', postData);
  if (result.success) {
    testPostId = result.data.post?.id || result.data.id;
    console.log('✅ Post created');
    console.log(`   ID: ${testPostId}`);
    console.log(`   Title: ${result.data.post?.title || result.data.title}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testGetPosts() {
  console.log('\n📝 Testing Get Posts...');
  const result = await apiRequest('GET', `/post/board/${testBoardTypeId}`);
  if (result.success) {
    console.log('✅ Posts fetched');
    console.log(`   Total: ${result.data.pagination?.totalCount || 0}`);
    console.log(`   Items: ${result.data.posts?.length || 0}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testGetPostById() {
  console.log('\n📝 Testing Get Post by ID...');
  const result = await apiRequest('GET', `/post/${testPostId}`);
  if (result.success) {
    console.log('✅ Post fetched');
    console.log(`   Title: ${result.data.post?.title || result.data.title}`);
    console.log(`   Views: ${result.data.post?.viewCount || result.data.viewCount || 0}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testLikePost() {
  console.log('\n📝 Testing Like Post...');
  const result = await apiRequest('POST', `/post/${testPostId}/like`);
  if (result.success) {
    console.log('✅ Post liked');
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testPinPost() {
  console.log('\n📝 Testing Pin Post...');
  const result = await apiRequest('POST', `/post/${testPostId}/pin`);
  if (result.success) {
    console.log('✅ Post pinned');
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testCreateComment() {
  console.log('\n📝 Testing Create Comment...');
  const commentData = { ...testComment, postId: testPostId };
  const result = await apiRequest('POST', '/comment', commentData);
  if (result.success) {
    testCommentId = result.data.comment?.id || result.data.id;
    console.log('✅ Comment created');
    console.log(`   ID: ${testCommentId}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testGetComments() {
  console.log('\n📝 Testing Get Comments...');
  const result = await apiRequest('GET', `/comment/post/${testPostId}`);
  if (result.success) {
    console.log('✅ Comments fetched');
    console.log(`   Total: ${result.data.comments?.length || 0}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testUpdatePost() {
  console.log('\n📝 Testing Update Post...');
  const updateData = {
    title: 'Updated Test Post Title',
    content: '<p>Updated content</p>'
  };
  const result = await apiRequest('PUT', `/post/${testPostId}`, updateData);
  if (result.success) {
    console.log('✅ Post updated');
    console.log(`   New Title: ${result.data.post?.title || result.data.title}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testBoardTypeStats() {
  console.log('\n📝 Testing Board Type Stats...');
  const result = await apiRequest('GET', `/board-type/${testBoardTypeId}/stats`);
  if (result.success) {
    console.log('✅ Stats fetched');
    console.log(`   Posts: ${result.data.stats?.postCount || 0}`);
    console.log(`   Comments: ${result.data.stats?.commentCount || 0}`);
    console.log(`   Likes: ${result.data.stats?.likeCount || 0}`);
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

// Cleanup functions
async function testDeleteComment() {
  console.log('\n📝 Testing Delete Comment...');
  const result = await apiRequest('DELETE', `/comment/${testCommentId}`);
  if (result.success) {
    console.log('✅ Comment deleted');
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testDeletePost() {
  console.log('\n📝 Testing Delete Post...');
  const result = await apiRequest('DELETE', `/post/${testPostId}`);
  if (result.success) {
    console.log('✅ Post deleted');
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

async function testDeleteBoardType() {
  console.log('\n📝 Testing Delete Board Type...');
  const result = await apiRequest('DELETE', `/board-type/${testBoardTypeId}`);
  if (result.success) {
    console.log('✅ Board type deleted');
    return true;
  } else {
    console.log('❌ Failed:', result.error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      Board System API Tests                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Create Board Type', fn: testCreateBoardType },
    { name: 'Get Board Types', fn: testGetBoardTypes },
    { name: 'Get Board Type by ID', fn: testGetBoardTypeById },
    { name: 'Create Post', fn: testCreatePost },
    { name: 'Get Posts', fn: testGetPosts },
    { name: 'Get Post by ID', fn: testGetPostById },
    { name: 'Like Post', fn: testLikePost },
    { name: 'Pin Post', fn: testPinPost },
    { name: 'Create Comment', fn: testCreateComment },
    { name: 'Get Comments', fn: testGetComments },
    { name: 'Update Post', fn: testUpdatePost },
    { name: 'Board Type Stats', fn: testBoardTypeStats },
    { name: 'Delete Comment', fn: testDeleteComment },
    { name: 'Delete Post', fn: testDeletePost },
    { name: 'Delete Board Type', fn: testDeleteBoardType }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      Test Results                                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests: ${tests.length.toString().padEnd(44)} ║`);
  console.log(`║  Passed: ${passed.toString().padEnd(49)} ║`);
  console.log(`║  Failed: ${failed.toString().padEnd(49)} ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
