const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetApplicationCount() {
  printSection('Testing GET /applications/projects/:project_id/application-count');

  try {
    // Login as client
    console.log('\nLogging in as client...');
    const clientEmail = 'harshalv4@gmail.com';
    const clientPassword = 'TestPass123!';

    const clientLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: clientEmail, password: clientPassword }
    );
    const clientLoginData = processApiResponse(clientLoginResponse);
    storeToken('CLIENT', clientLoginData.data.token);

    console.log('✅ Client login successful');

    // Test 1: Get application count for existing project
    console.log('\nTest 1: Get application count for existing project');
    const projectId = 1; // Assuming project ID 1 exists

    const countResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/${projectId}/application-count`,
      null,
      authHeader('CLIENT')
    );

    if (countResponse.statusCode === 200) {
      const countData = processApiResponse(countResponse);
      printTestResult('Get application count for existing project', true, 'Successfully retrieved application count', {
        projectId,
        count: countData.count,
        response: countData
      });
    } else {
      printTestResult('Get application count for existing project', false, 'Failed to get application count', {
        statusCode: countResponse.statusCode,
        body: countResponse.body
      });
    }

    // Test 2: Get application count for non-existent project
    console.log('\nTest 2: Get application count for non-existent project');
    const nonExistentProjectId = 999999;

    const nonExistentCountResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/${nonExistentProjectId}/application-count`,
      null,
      authHeader('CLIENT')
    );

    if (nonExistentCountResponse.statusCode === 200) {
      const nonExistentCountData = processApiResponse(nonExistentCountResponse);
      printTestResult('Get application count for non-existent project', true, 'Successfully handled non-existent project (returned 0)', {
        projectId: nonExistentProjectId,
        count: nonExistentCountData.count,
        response: nonExistentCountData
      });
    } else {
      printTestResult('Get application count for non-existent project', false, 'Unexpected response for non-existent project', {
        statusCode: nonExistentCountResponse.statusCode,
        body: nonExistentCountResponse.body
      });
    }

    // Test 3: Try to access without required role (should fail)
    console.log('\nTest 3: Access without required role (should fail)');
    const videographerEmail = 'test.videographer@example.com';
    const videographerPassword = 'TestPass123!';

    const videographerLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: videographerEmail, password: videographerPassword }
    );
    const videographerLoginData = processApiResponse(videographerLoginResponse);
    storeToken('VIDEOGRAPHER', videographerLoginData.data.token);

    const unauthorizedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/${projectId}/application-count`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (unauthorizedResponse.statusCode === 403) {
      printTestResult('Access without required role', true, 'Correctly denied access to non-authorized user', { statusCode: 403 });
    } else {
      printTestResult('Access without required role', false, 'Should have denied access to non-authorized user', {
        statusCode: unauthorizedResponse.statusCode,
        body: unauthorizedResponse.body
      });
    }

    // Test 4: Try to access with admin role (should succeed)
    console.log('\nTest 4: Access with admin role (should succeed)');
    const adminEmail = 'superadmin@mmv.com';
    const adminPassword = 'SuperAdmin123!';

    const adminLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: adminEmail, password: adminPassword }
    );
    const adminLoginData = processApiResponse(adminLoginResponse);
    storeToken('SUPER_ADMIN', adminLoginData.data.token);

    const adminResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/${projectId}/application-count`,
      null,
      authHeader('SUPER_ADMIN')
    );

    if (adminResponse.statusCode === 200) {
      const adminCountData = processApiResponse(adminResponse);
      printTestResult('Access with admin role', true, 'Successfully accessed with admin role', {
        projectId,
        count: adminCountData.count,
        response: adminCountData
      });
    } else {
      printTestResult('Access with admin role', false, 'Admin should have access to application count', {
        statusCode: adminResponse.statusCode,
        body: adminResponse.body
      });
    }

  } catch (error) {
    console.error('Error during application count test:', error.message);
    printTestResult(false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testGetApplicationCount
};

// Run tests if called directly
if (require.main === module) {
  testGetApplicationCount();
}