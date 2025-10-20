const http = require('http');
const { CONFIG, makeRequest, COLORS } = require('../test-utils');

// Configuration
const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;
const API_PREFIX = '/api/v1';

// Test data
const testUsers = {
  superAdmin: {
    email: 'testadmin@example.com',
    password: 'TestAdmin123!'
  }
};

// Global variables
let superAdminToken = '';

/**
 * Test: Get Tags by Type (GET /api/v1/tags/type/:type)
 */
async function testGetTagsByType() {
  console.log('\n🧪 Testing: Get Tags by Type (GET /api/v1/tags/type/:type)');
  console.log('='.repeat(50));

  try {
    // First, login as super admin to get token
    console.log('🔐 Logging in as super admin...');
    const loginResponse = await makeRequest('POST', `${BASE_URL}/auth/login`, {
      email: testUsers.superAdmin.email,
      password: testUsers.superAdmin.password
    });

    if (loginResponse.statusCode !== 200) {
      throw new Error(`Login failed: ${loginResponse.statusCode} - ${JSON.stringify(loginResponse.body)}`);
    }

    superAdminToken = loginResponse.body.data.token;
    console.log('✅ Super admin login successful');

    // First, create test tags of different types
    console.log('📝 Creating test tags of different types...');

    const blogTag = {
      tag_name: 'Blog Category Tag',
      tag_value: 'blog-cat-1',
      tag_type: 'blog',
      created_by: 1
    };

    const projectTag = {
      tag_name: 'Project Type Tag',
      tag_value: 'project-type-1',
      tag_type: 'project',
      created_by: 1
    };

    // Create blog tag
    const blogCreateResponse = await makeRequest('POST', `${BASE_URL}/tags`, blogTag, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    // Create project tag
    const projectCreateResponse = await makeRequest('POST', `${BASE_URL}/tags`, projectTag, {
      'Authorization': `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json'
    });

    if (blogCreateResponse.statusCode !== 201 || projectCreateResponse.statusCode !== 201) {
      console.log(`${COLORS.yellow}⚠️  Warning: Could not create test tags, but continuing with test${COLORS.reset}`);
    }

    // Test getting blog tags
    console.log('📝 Fetching tags of type "blog"...');
    const getBlogTagsResponse = await makeRequest('GET', `${BASE_URL}/tags/type/blog`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Blog Tags Response Status: ${getBlogTagsResponse.statusCode}`);

    if (getBlogTagsResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Blog tags fetched successfully${COLORS.reset}`);

      if (getBlogTagsResponse.body && getBlogTagsResponse.body.data) {
        const blogTags = getBlogTagsResponse.body.data;

        if (Array.isArray(blogTags)) {
          console.log(`📊 Found ${blogTags.length} blog tags`);

          // Check that all returned tags are of type 'blog'
          const allBlogTags = blogTags.every(tag => tag.tag_type === 'blog');
          if (allBlogTags) {
            console.log(`${COLORS.green}✅ PASS: All returned tags are of type 'blog'${COLORS.reset}`);
          } else {
            console.log(`${COLORS.red}❌ FAIL: Some returned tags are not of type 'blog'${COLORS.reset}`);
            return { success: false };
          }
        } else {
          console.log(`${COLORS.red}❌ FAIL: Blog tags response is not an array${COLORS.reset}`);
          return { success: false };
        }
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200 for blog tags, got ${getBlogTagsResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

    // Test getting project tags
    console.log('📝 Fetching tags of type "project"...');
    const getProjectTagsResponse = await makeRequest('GET', `${BASE_URL}/tags/type/project`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Project Tags Response Status: ${getProjectTagsResponse.statusCode}`);

    if (getProjectTagsResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Project tags fetched successfully${COLORS.reset}`);

      if (getProjectTagsResponse.body && getProjectTagsResponse.body.data) {
        const projectTags = getProjectTagsResponse.body.data;

        if (Array.isArray(projectTags)) {
          console.log(`📊 Found ${projectTags.length} project tags`);

          // Check that all returned tags are of type 'project'
          const allProjectTags = projectTags.every(tag => tag.tag_type === 'project');
          if (allProjectTags) {
            console.log(`${COLORS.green}✅ PASS: All returned tags are of type 'project'${COLORS.reset}`);
            return { success: true };
          } else {
            console.log(`${COLORS.red}❌ FAIL: Some returned tags are not of type 'project'${COLORS.reset}`);
            return { success: false };
          }
        } else {
          console.log(`${COLORS.red}❌ FAIL: Project tags response is not an array${COLORS.reset}`);
          return { success: false };
        }
      }
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200 for project tags, got ${getProjectTagsResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Get Tags by Type - Empty Result
 */
async function testGetTagsByTypeEmpty() {
  console.log('\n🧪 Testing: Get Tags by Type - Empty Result');
  console.log('='.repeat(50));

  try {
    const nonExistentType = 'nonexistent';

    console.log(`📝 Fetching tags of non-existent type: "${nonExistentType}"...`);
    const getResponse = await makeRequest('GET', `${BASE_URL}/tags/type/${nonExistentType}`, null, {
      'Authorization': `Bearer ${superAdminToken}`
    });

    console.log(`📊 Response Status: ${getResponse.statusCode}`);

    if (getResponse.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS: Correctly returned empty array for non-existent type${COLORS.reset}`);

      if (getResponse.body && getResponse.body.data) {
        const tags = getResponse.body.data;
        if (Array.isArray(tags) && tags.length === 0) {
          console.log(`${COLORS.green}✅ PASS: Returned empty array as expected${COLORS.reset}`);
          return { success: true };
        } else {
          console.log(`${COLORS.red}❌ FAIL: Should have returned empty array${COLORS.reset}`);
          return { success: false };
        }
      }
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Expected status 200, got ${getResponse.statusCode}${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

/**
 * Test: Get Tags by Type without Authentication
 */
async function testGetTagsByTypeNoAuth() {
  console.log('\n🧪 Testing: Get Tags by Type without Authentication');
  console.log('='.repeat(50));

  try {
    console.log('📝 Attempting to fetch tags by type without authentication...');
    const getResponse = await makeRequest('GET', `${BASE_URL}/tags/type/blog`);

    console.log(`📊 Response Status: ${getResponse.statusCode}`);

    if (getResponse.statusCode === 401 || getResponse.statusCode === 403) {
      console.log(`${COLORS.green}✅ PASS: Correctly rejected unauthenticated request${COLORS.reset}`);
      return { success: true };
    } else {
      console.log(`${COLORS.red}❌ FAIL: Should have rejected unauthenticated request${COLORS.reset}`);
      return { success: false };
    }

  } catch (error) {
    console.error(`${COLORS.red}💥 ERROR: ${error.message}${COLORS.reset}`);
    return { success: false };
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Get Tags by Type Tests');
  console.log('=====================================');

  const results = [];

  // Test successful get tags by type
  const getByTypeResult = await testGetTagsByType();
  results.push({ test: 'Get Tags by Type - Success', ...getByTypeResult });

  // Test empty result
  const emptyResult = await testGetTagsByTypeEmpty();
  results.push({ test: 'Get Tags by Type - Empty', ...emptyResult });

  // Test no authentication
  const noAuthResult = await testGetTagsByTypeNoAuth();
  results.push({ test: 'Get Tags by Type - No Auth', ...noAuthResult });

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.success ? `${COLORS.green}✅ PASS${COLORS.reset}` : `${COLORS.red}❌ FAIL${COLORS.reset}`;
    console.log(`${status} ${result.test}`);
  });

  console.log(`\n📈 Total: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log(`${COLORS.green}🎉 All tests passed!${COLORS.reset}`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}💥 Some tests failed${COLORS.reset}`);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testGetTagsByType, testGetTagsByTypeEmpty, testGetTagsByTypeNoAuth };