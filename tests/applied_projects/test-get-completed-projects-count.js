const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetCompletedProjectsCount() {
  printSection('Testing GET /applications/projects/completed-count');

  try {
    // Test 1: Get completed projects count as admin
    console.log('\nTest 1: Get completed projects count as admin');
    const adminEmail = 'testadmin@example.com';
    const adminPassword = 'TestAdmin123!';

    const adminLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: adminEmail, password: adminPassword }
    );
    const adminLoginData = processApiResponse(adminLoginResponse);
    storeToken('SUPER_ADMIN', adminLoginData.data.token);

    console.log('✅ Admin login successful');

    const adminCountResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/completed-count`,
      null,
      authHeader('SUPER_ADMIN')
    );

    if (adminCountResponse.statusCode === 200) {
      const adminCountData = processApiResponse(adminCountResponse);
      printTestResult('Get completed projects count as admin', true, 'Successfully retrieved completed projects count', {
        count: adminCountData.data.completed_projects,
        response: adminCountData
      });
    } else {
      printTestResult('Get completed projects count as admin', false, 'Failed to get completed projects count', {
        statusCode: adminCountResponse.statusCode,
        body: adminCountResponse.body
      });
    }

    // Test 2: Get completed projects count as super admin
    console.log('\nTest 2: Get completed projects count as super admin');
    // Already logged in as super admin from previous test

    const superAdminCountResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/completed-count`,
      null,
      authHeader('SUPER_ADMIN')
    );

    if (superAdminCountResponse.statusCode === 200) {
      const superAdminCountData = processApiResponse(superAdminCountResponse);
      printTestResult('Get completed projects count as super admin', true, 'Successfully retrieved completed projects count', {
        count: superAdminCountData.data.completed_projects,
        response: superAdminCountData
      });
    } else {
      printTestResult('Get completed projects count as super admin', false, 'Failed to get completed projects count', {
        statusCode: superAdminCountResponse.statusCode,
        body: superAdminCountResponse.body
      });
    }

    // Test 3: Try to access with unauthorized role (should fail)
    console.log('\nTest 3: Access with unauthorized role (should fail)');
    const clientEmail = 'test.client@example.com';
    const clientPassword = 'TestPass123!';

    const clientLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: clientEmail, password: clientPassword }
    );
    const clientLoginData = processApiResponse(clientLoginResponse);
    storeToken('CLIENT', clientLoginData.data.token);

    const unauthorizedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/completed-count`,
      null,
      authHeader('CLIENT')
    );

    if (unauthorizedResponse.statusCode === 403) {
      printTestResult('Unauthorized role access check', true, 'Correctly denied access to unauthorized role', { statusCode: 403 });
    } else {
      printTestResult('Unauthorized role access check', false, 'Should have denied access to unauthorized role', {
        statusCode: unauthorizedResponse.statusCode,
        body: unauthorizedResponse.body
      });
    }

    // Test 4: Try to access with videographer role (should fail)
    console.log('\nTest 4: Access with videographer role (should fail)');
    const videographerEmail = 'test.videographer@example.com';
    const videographerPassword = 'TestPass123!';

    const videographerLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: videographerEmail, password: videographerPassword }
    );
    const videographerLoginData = processApiResponse(videographerLoginResponse);
    storeToken('VIDEOGRAPHER', videographerLoginData.data.token);

    const videographerResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/completed-count`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (videographerResponse.statusCode === 403) {
      printTestResult('Videographer access check', true, 'Correctly denied access to videographer', { statusCode: 403 });
    } else {
      printTestResult('Videographer access check', false, 'Should have denied access to videographer', {
        statusCode: videographerResponse.statusCode,
        body: videographerResponse.body
      });
    }

    // Test 5: Try to access without authentication (should fail)
    console.log('\nTest 5: Access without authentication (should fail)');
    const unauthenticatedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/completed-count`,
      null,
      {} // No auth header
    );

    if (unauthenticatedResponse.statusCode === 401) {
      printTestResult('Unauthenticated access check', true, 'Correctly denied access without authentication', { statusCode: 401 });
    } else {
      printTestResult('Unauthenticated access check', false, 'Should have denied access without authentication', {
        statusCode: unauthenticatedResponse.statusCode,
        body: unauthenticatedResponse.body
      });
    }

  } catch (error) {
    console.error('Error during completed projects count test:', error.message);
    printTestResult('Completed projects count test', false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testGetCompletedProjectsCount
};

// Run tests if called directly
if (require.main === module) {
  testGetCompletedProjectsCount();
}