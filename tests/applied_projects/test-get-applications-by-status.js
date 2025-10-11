const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetApplicationsByStatus() {
  printSection('Testing GET /applications/status/:status');

  try {
    // Login as videographer
    console.log('\nLogging in as videographer...');
    const videographerEmail = 'test.videographer@example.com';
    const videographerPassword = 'TestPass123!';

    const videographerLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: videographerEmail, password: videographerPassword }
    );
    const videographerLoginData = processApiResponse(videographerLoginResponse);
    storeToken('VIDEOGRAPHER', videographerLoginData.data.token);

    console.log('✅ Videographer login successful');

    // Test 1: Get applications with status 0 (pending)
    console.log('\nTest 1: Get applications with status 0 (pending)');
    const status0Response = await makeRequest(
      'GET',
      `${BASE_URL}/applications/status/0`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (status0Response.statusCode === 200) {
      const status0Data = processApiResponse(status0Response);
      printTestResult('Get pending applications', true, 'Successfully retrieved pending applications', {
        status: 0,
        count: status0Data.data ? status0Data.data.length : 0,
        response: status0Data
      });
    } else {
      printTestResult('Get pending applications', false, 'Failed to get pending applications', {
        statusCode: status0Response.statusCode,
        body: status0Response.body
      });
    }

    // Test 2: Get applications with status 1 (ongoing)
    console.log('\nTest 2: Get applications with status 1 (ongoing)');
    const status1Response = await makeRequest(
      'GET',
      `${BASE_URL}/applications/status/1`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (status1Response.statusCode === 200) {
      const status1Data = processApiResponse(status1Response);
      printTestResult('Get ongoing applications', true, 'Successfully retrieved ongoing applications', {
        status: 1,
        count: status1Data.data ? status1Data.data.length : 0,
        response: status1Data
      });
    } else {
      printTestResult('Get ongoing applications', false, 'Failed to get ongoing applications', {
        statusCode: status1Response.statusCode,
        body: status1Response.body
      });
    }

    // Test 3: Get applications with status 2 (completed)
    console.log('\nTest 3: Get applications with status 2 (completed)');
    const status2Response = await makeRequest(
      'GET',
      `${BASE_URL}/applications/status/2`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (status2Response.statusCode === 200) {
      const status2Data = processApiResponse(status2Response);
      printTestResult('Get completed applications', true, 'Successfully retrieved completed applications', {
        status: 2,
        count: status2Data.data ? status2Data.data.length : 0,
        response: status2Data
      });
    } else {
      printTestResult('Get completed applications', false, 'Failed to get completed applications', {
        statusCode: status2Response.statusCode,
        body: status2Response.body
      });
    }

    // Test 4: Get applications with status 3 (rejected)
    console.log('\nTest 4: Get applications with status 3 (rejected)');
    const status3Response = await makeRequest(
      'GET',
      `${BASE_URL}/applications/status/3`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (status3Response.statusCode === 200) {
      const status3Data = processApiResponse(status3Response);
      printTestResult('Get rejected applications', true, 'Successfully retrieved rejected applications', {
        status: 3,
        count: status3Data.data ? status3Data.data.length : 0,
        response: status3Data
      });
    } else {
      printTestResult('Get rejected applications', false, 'Failed to get rejected applications', {
        statusCode: status3Response.statusCode,
        body: status3Response.body
      });
    }

    // Test 5: Try invalid status (should fail)
    console.log('\nTest 5: Try invalid status (should fail)');
    const invalidStatusResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/status/5`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (invalidStatusResponse.statusCode === 400) {
      printTestResult('Invalid status validation', true, 'Correctly rejected invalid status', { statusCode: 400 });
    } else {
      printTestResult('Invalid status validation', false, 'Should have rejected invalid status', {
        statusCode: invalidStatusResponse.statusCode,
        body: invalidStatusResponse.body
      });
    }

    // Test 6: Try to access with unauthorized role (should fail)
    console.log('\nTest 6: Access with unauthorized role (should fail)');
    const adminEmail = 'superadmin@mmv.com';
    const adminPassword = 'SuperAdmin123!';

    const adminLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: adminEmail, password: adminPassword }
    );
    const adminLoginData = processApiResponse(adminLoginResponse);
    storeToken('SUPER_ADMIN', adminLoginData.data.token);

    const unauthorizedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/status/0`,
      null,
      authHeader('SUPER_ADMIN')
    );

    if (unauthorizedResponse.statusCode === 403) {
      printTestResult('Unauthorized access check', true, 'Correctly denied access to unauthorized role', { statusCode: 403 });
    } else {
      printTestResult('Unauthorized access check', false, 'Should have denied access to unauthorized role', {
        statusCode: unauthorizedResponse.statusCode,
        body: unauthorizedResponse.body
      });
    }

  } catch (error) {
    console.error('Error during status filtering test:', error.message);
    printTestResult('Status filtering test', false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testGetApplicationsByStatus
};

// Run tests if called directly
if (require.main === module) {
  testGetApplicationsByStatus();
}