const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Test data
let superAdminToken = '';
let adminToken = '';
let regularUserToken = '';
let testUserId = 0;
let testRoleId = 0;

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    // Set default port to 8000 for API server
    const requestOptions = { ...options, port: options.port || 8000 };
    const req = http.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test counter
let testCount = 0;
let passedTests = 0;

function logTest(testName, passed, details = '') {
  testCount++;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  if (passed) passedTests++;
}

// Authentication helper
async function authenticateAs(role) {
  const loginData = {
    email: role === 'super_admin' ? 'superadmin@mmv.com' :
           role === 'admin' ? 'admin@example.com' : 'user@example.com',
    password: role === 'super_admin' ? 'SuperAdmin123!' : 'password123'
  };

  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: `${API_PREFIX}/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, loginData);

    if (response.statusCode === 200 && response.body?.success) {
      return response.body.data.token;
    }
  } catch (error) {
    console.log(`Authentication failed for ${role}:`, error.message);
  }
  return null;
}

// Setup function
async function setup() {
  console.log('🔧 Setting up test environment...\n');

  // Authenticate users
  superAdminToken = await authenticateAs('super_admin');
  adminToken = await authenticateAs('admin');
  regularUserToken = await authenticateAs('user');

  if (!superAdminToken) {
    console.log('❌ Failed to authenticate super admin');
    process.exit(1);
  }

  // Get a test user ID (try to get any user, fallback to super admin)
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: `${API_PREFIX}/users`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    if (response.statusCode === 200 && response.body?.success && response.body.data.users.length > 0) {
      testUserId = response.body.data.users[0].user_id;
      console.log(`📋 Using test user ID: ${testUserId}`);
    } else {
      // If no users found, try to get current user info
      const userResponse = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: `${API_PREFIX}/users/me`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      if (userResponse.statusCode === 200 && userResponse.body?.success) {
        testUserId = userResponse.body.data.user_id;
        console.log(`📋 Using current user ID: ${testUserId}`);
      } else {
        console.log('❌ Failed to get any user for testing');
        process.exit(1);
      }
    }
  } catch (error) {
    console.log('❌ Setup failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Setup complete\n');
}

// Test functions
async function testGetUserRoles() {
  console.log('🧪 Testing GET /users/:id/roles\n');

  // Test 1: Super admin can get user roles
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      path: `${API_PREFIX}/users/${testUserId}/roles`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 200 &&
                   response.body?.success === true &&
                   Array.isArray(response.body.data);
    logTest('Super admin can get user roles', passed,
      `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
  } catch (error) {
    logTest('Super admin can get user roles', false, `Error: ${error.message}`);
  }

  // Test 2: Admin can get user roles
  if (adminToken) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        path: `${API_PREFIX}/users/${testUserId}/roles`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const passed = response.statusCode === 200 &&
                     response.body?.success === true &&
                     Array.isArray(response.body.data);
      logTest('Admin can get user roles', passed,
        `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
    } catch (error) {
      logTest('Admin can get user roles', false, `Error: ${error.message}`);
    }
  }

  // Test 3: Regular user cannot get user roles
  if (regularUserToken) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/roles`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${regularUserToken}`
        }
      });

      const passed = response.statusCode === 403;
      logTest('Regular user cannot get user roles', passed,
        `Status: ${response.statusCode}, Expected: 403`);
    } catch (error) {
      logTest('Regular user cannot get user roles', false, `Error: ${error.message}`);
    }
  }

  // Test 4: No auth header
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles`,
      method: 'GET'
    });

    const passed = response.statusCode === 404; // Auth middleware returns 404 for missing token
    logTest('No auth header returns 404', passed,
      `Status: ${response.statusCode}, Expected: 404`);
  } catch (error) {
    logTest('No auth header returns 404', false, `Error: ${error.message}`);
  }

  // Test 5: Invalid user ID
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/invalid/roles`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 500; // Server error for invalid ID parsing
    logTest('Invalid user ID returns 500', passed,
      `Status: ${response.statusCode}, Expected: 500`);
  } catch (error) {
    logTest('Invalid user ID returns 500', false, `Error: ${error.message}`);
  }

  // Test 6: Non-existent user
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/99999/roles`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 200 &&
                   response.body?.success === true &&
                   Array.isArray(response.body.data) &&
                   response.body.data.length === 0; // Empty array for non-existent user
    logTest('Non-existent user returns empty array', passed,
      `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
  } catch (error) {
    logTest('Non-existent user returns empty array', false, `Error: ${error.message}`);
  }

  console.log('');
}

async function testAssignRoleToUser() {
  console.log('🧪 Testing POST /users/:id/roles\n');

  // Test 1: Super admin can assign role
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      }
    }, { roleName: 'CLIENT' });

    const passed = response.statusCode === 200 &&
                   response.body?.success === true &&
                   response.body.message.includes('assigned to user successfully');
    logTest('Super admin can assign role', passed,
      `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
  } catch (error) {
    logTest('Super admin can assign role', false, `Error: ${error.message}`);
  }

  // Test 2: Admin cannot assign role
  if (adminToken) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/roles`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }, { roleName: 'CLIENT' });

      const passed = response.statusCode === 403;
      logTest('Admin cannot assign role', passed,
        `Status: ${response.statusCode}, Expected: 403`);
    } catch (error) {
      logTest('Admin cannot assign role', false, `Error: ${error.message}`);
    }
  }

  // Test 3: Regular user cannot assign role
  if (regularUserToken) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/roles`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${regularUserToken}`,
          'Content-Type': 'application/json'
        }
      }, { roleName: 'CLIENT' });

      const passed = response.statusCode === 403;
      logTest('Regular user cannot assign role', passed,
        `Status: ${response.statusCode}, Expected: 403`);
    } catch (error) {
      logTest('Regular user cannot assign role', false, `Error: ${error.message}`);
    }
  }

  // Test 4: No auth header
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { roleName: 'CLIENT' });

    const passed = response.statusCode === 404;
    logTest('No auth header returns 404', passed,
      `Status: ${response.statusCode}, Expected: 404`);
  } catch (error) {
    logTest('No auth header returns 404', false, `Error: ${error.message}`);
  }

  // Test 5: Missing role name
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      }
    }, {});

    const passed = response.statusCode === 400 &&
                   response.body?.message.includes('roleName should not be empty');
    logTest('Missing role name returns 400', passed,
      `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
  } catch (error) {
    logTest('Missing role name returns 400', false, `Error: ${error.message}`);
  }

  // Test 6: Invalid role name
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      }
    }, { roleName: 'INVALID_ROLE' });

    const passed = response.statusCode === 400; // Validation error
    logTest('Invalid role name returns 400', passed,
      `Status: ${response.statusCode}, Expected: 400`);
  } catch (error) {
    logTest('Invalid role name returns 400', false, `Error: ${error.message}`);
  }

  // Test 7: Invalid user ID
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/invalid/roles`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      }
    }, { roleName: 'CLIENT' });

    const passed = response.statusCode === 500;
    logTest('Invalid user ID returns 500', passed,
      `Status: ${response.statusCode}, Expected: 500`);
  } catch (error) {
    logTest('Invalid user ID returns 500', false, `Error: ${error.message}`);
  }

  console.log('');
}

async function testRemoveRoleFromUser() {
  console.log('🧪 Testing DELETE /users/:id/roles/:roleId\n');

  // First, get a role ID to remove
  let roleIdToRemove = null;
  try {
    const rolesResponse = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    if (rolesResponse.statusCode === 200 && rolesResponse.body?.data?.length > 0) {
      roleIdToRemove = rolesResponse.body.data[0].role_id;
    }
  } catch (error) {
    console.log('Could not get role ID for removal test');
  }

  if (roleIdToRemove) {
    // Test 1: Super admin can remove role
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/roles/${roleIdToRemove}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${superAdminToken}`
        }
      });

      const passed = response.statusCode === 200 &&
                     response.body?.success === true &&
                     response.body.message.includes('removed from user successfully');
      logTest('Super admin can remove role', passed,
        `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
    } catch (error) {
      logTest('Super admin can remove role', false, `Error: ${error.message}`);
    }
  } else {
    logTest('Super admin can remove role', false, 'No role found to remove');
  }

  // Test 2: Admin cannot remove role
  if (adminToken && roleIdToRemove) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/roles/${roleIdToRemove}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const passed = response.statusCode === 403;
      logTest('Admin cannot remove role', passed,
        `Status: ${response.statusCode}, Expected: 403`);
    } catch (error) {
      logTest('Admin cannot remove role', false, `Error: ${error.message}`);
    }
  }

  // Test 3: Regular user cannot remove role
  if (regularUserToken && roleIdToRemove) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/roles/${roleIdToRemove}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${regularUserToken}`
        }
      });

      const passed = response.statusCode === 403;
      logTest('Regular user cannot remove role', passed,
        `Status: ${response.statusCode}, Expected: 403`);
    } catch (error) {
      logTest('Regular user cannot remove role', false, `Error: ${error.message}`);
    }
  }

  // Test 4: No auth header
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles/1`,
      method: 'DELETE'
    });

    const passed = response.statusCode === 404;
    logTest('No auth header returns 404', passed,
      `Status: ${response.statusCode}, Expected: 404`);
  } catch (error) {
    logTest('No auth header returns 404', false, `Error: ${error.message}`);
  }

  // Test 5: Invalid user ID
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/invalid/roles/1`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 500;
    logTest('Invalid user ID returns 500', passed,
      `Status: ${response.statusCode}, Expected: 500`);
  } catch (error) {
    logTest('Invalid user ID returns 500', false, `Error: ${error.message}`);
  }

  // Test 6: Invalid role ID
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/roles/invalid`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 500;
    logTest('Invalid role ID returns 500', passed,
      `Status: ${response.statusCode}, Expected: 500`);
  } catch (error) {
    logTest('Invalid role ID returns 500', false, `Error: ${error.message}`);
  }

  console.log('');
}

async function testGetUserPermissions() {
  console.log('🧪 Testing GET /users/:id/permissions\n');

  // Test 1: Super admin can get user permissions
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/permissions`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 200 &&
                   response.body?.success === true &&
                   Array.isArray(response.body.data);
    logTest('Super admin can get user permissions', passed,
      `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
  } catch (error) {
    logTest('Super admin can get user permissions', false, `Error: ${error.message}`);
  }

  // Test 2: Admin can get user permissions
  if (adminToken) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/permissions`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const passed = response.statusCode === 200 &&
                     response.body?.success === true &&
                     Array.isArray(response.body.data);
      logTest('Admin can get user permissions', passed,
        `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
    } catch (error) {
      logTest('Admin can get user permissions', false, `Error: ${error.message}`);
    }
  }

  // Test 3: Regular user cannot get user permissions
  if (regularUserToken) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        
        path: `${API_PREFIX}/users/${testUserId}/permissions`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${regularUserToken}`
        }
      });

      const passed = response.statusCode === 403;
      logTest('Regular user cannot get user permissions', passed,
        `Status: ${response.statusCode}, Expected: 403`);
    } catch (error) {
      logTest('Regular user cannot get user permissions', false, `Error: ${error.message}`);
    }
  }

  // Test 4: No auth header
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/${testUserId}/permissions`,
      method: 'GET'
    });

    const passed = response.statusCode === 404;
    logTest('No auth header returns 404', passed,
      `Status: ${response.statusCode}, Expected: 404`);
  } catch (error) {
    logTest('No auth header returns 404', false, `Error: ${error.message}`);
  }

  // Test 5: Invalid user ID
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/invalid/permissions`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 500;
    logTest('Invalid user ID returns 500', passed,
      `Status: ${response.statusCode}, Expected: 500`);
  } catch (error) {
    logTest('Invalid user ID returns 500', false, `Error: ${error.message}`);
  }

  // Test 6: Non-existent user returns empty array
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      
      path: `${API_PREFIX}/users/99999/permissions`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`
      }
    });

    const passed = response.statusCode === 200 &&
                   response.body?.success === true &&
                   Array.isArray(response.body.data) &&
                   response.body.data.length === 0; // Empty array for non-existent user
    logTest('Non-existent user returns empty array', passed,
      `Status: ${response.statusCode}, Response: ${JSON.stringify(response.body)}`);
  } catch (error) {
    logTest('Non-existent user returns empty array', false, `Error: ${error.message}`);
  }

  console.log('');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Role Management API Tests\n');
  console.log('=' .repeat(50));

  try {
    await setup();

    await testGetUserRoles();
    await testAssignRoleToUser();
    await testRemoveRoleFromUser();
    await testGetUserPermissions();

    console.log('=' .repeat(50));
    console.log(`📊 Test Results: ${passedTests}/${testCount} tests passed (${((passedTests/testCount)*100).toFixed(1)}% success rate)`);

    if (passedTests === testCount) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();