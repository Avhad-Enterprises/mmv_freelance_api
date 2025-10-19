const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetProjectApplications() {
  printSection('Testing GET /applications/projects/:project_id/applications');

  try {
    // Try different client credentials
    const clientCredentials = [
      { email: 'test.client@example.com', password: 'TestPass123!' }
    ];

    let clientToken = null;
    let clientEmail = '';

    for (const creds of clientCredentials) {
      console.log(`\nTrying to login as client: ${creds.email}`);
      const loginResponse = await makeRequest(
        'POST',
        `${BASE_URL}/auth/login`,
        { email: creds.email, password: creds.password }
      );

      if (loginResponse.statusCode === 200) {
        const loginData = processApiResponse(loginResponse);
        storeToken('CLIENT', loginData.data.token);
        clientToken = loginData.data.token;
        clientEmail = creds.email;
        console.log(`✅ Client login successful: ${creds.email}`);
        break;
      }
    }

    if (!clientToken) {
      printTestResult(false, 'Could not authenticate as any client', { message: 'No valid client credentials found' });
      return;
    }

    // Test 1: Get applications for a project that exists
    console.log('\nTest 1: Get applications for existing project');
    const projectId = 1; // Assuming project ID 1 exists

    const getApplicationsResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/${projectId}/applications`,
      null,
      authHeader('CLIENT')
    );

    if (getApplicationsResponse.statusCode === 200) {
      const applicationsData = processApiResponse(getApplicationsResponse);
      printTestResult(true, 'Successfully retrieved project applications', {
        projectId,
        applicationsCount: applicationsData.data ? applicationsData.data.length : 0,
        applications: applicationsData.data
      });
    } else {
      printTestResult(false, 'Failed to get project applications', {
        statusCode: getApplicationsResponse.statusCode,
        body: getApplicationsResponse.body
      });
    }

    // Test 2: Get applications for a project that doesn't exist
    console.log('\nTest 2: Get applications for non-existent project');
    const nonExistentProjectId = 999999;

    const nonExistentResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/${nonExistentProjectId}/applications`,
      null,
      authHeader('CLIENT')
    );

    if (nonExistentResponse.statusCode === 404) {
      printTestResult(true, 'Correctly handled non-existent project', { statusCode: 404 });
    } else if (nonExistentResponse.statusCode === 200) {
      // If it returns 200 with empty array, that's also acceptable
      const emptyData = processApiResponse(nonExistentResponse);
      printTestResult(true, 'Returned empty array for non-existent project', {
        statusCode: 200,
        applicationsCount: emptyData.data ? emptyData.data.length : 0
      });
    } else {
      printTestResult(false, 'Unexpected response for non-existent project', {
        statusCode: nonExistentResponse.statusCode,
        body: nonExistentResponse.body
      });
    }

    // Test 3: Try to access without CLIENT role (should fail)
    console.log('\nTest 3: Access without CLIENT role (should fail)');
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
      `${BASE_URL}/applications/projects/${projectId}/applications`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (unauthorizedResponse.statusCode === 403) {
      printTestResult(true, 'Correctly denied access to non-client user', { statusCode: 403 });
    } else {
      printTestResult(false, 'Should have denied access to non-client user', {
        statusCode: unauthorizedResponse.statusCode,
        body: unauthorizedResponse.body
      });
    }

  } catch (error) {
    console.error('Error during project applications test:', error.message);
    printTestResult(false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testGetProjectApplications
};

// Run tests if called directly
if (require.main === module) {
  testGetProjectApplications();
}