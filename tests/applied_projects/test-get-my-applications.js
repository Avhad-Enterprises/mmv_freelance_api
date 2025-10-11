const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetMyApplications() {
  printSection('Testing GET /applications/my-applications');

  try {
    // Test 1: Videographer can retrieve their applications
    console.log('\nTest 1: Videographer retrieves their applications');
    const videographerEmail = 'test.videographer@example.com';
    const videographerPassword = 'TestPass123!';

    // Login videographer
    const loginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: videographerEmail, password: videographerPassword }
    );
    const loginData = processApiResponse(loginResponse);
    storeToken('VIDEOGRAPHER', loginData.data.token);

    // Get my applications
    const getApplicationsResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/my-applications`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    console.log('Get applications response:', JSON.stringify(getApplicationsResponse, null, 2));

    printTestResult(
      getApplicationsResponse.statusCode === 200 &&
      Array.isArray(getApplicationsResponse.body.data),
      'Videographer can retrieve their applications',
      getApplicationsResponse
    );

    // Test 2: Video editor can retrieve their applications
    console.log('\nTest 2: Video editor retrieves their applications');
    const editorEmail = 'test.videoeditor@example.com';
    const editorPassword = 'TestPass123!';

    // Login video editor
    const loginEditorResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: editorEmail, password: editorPassword }
    );
    const loginEditorData = processApiResponse(loginEditorResponse);
    storeToken('VIDEO_EDITOR', loginEditorData.data.token);

    // Get my applications
    const getEditorApplicationsResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/my-applications`,
      null,
      authHeader('VIDEO_EDITOR')
    );

    console.log('Get editor applications response:', JSON.stringify(getEditorApplicationsResponse, null, 2));

    printTestResult(
      getEditorApplicationsResponse.statusCode === 200 &&
      Array.isArray(getEditorApplicationsResponse.body.data),
      'Video editor can retrieve their applications',
      getEditorApplicationsResponse
    );

    // Test 3: Unauthorized access (no token)
    console.log('\nTest 3: Unauthorized access without authentication');
    const unauthorizedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/my-applications`
    );

    console.log('Unauthorized response:', JSON.stringify(unauthorizedResponse, null, 2));

    printTestResult(
      unauthorizedResponse.statusCode === 401 ||
      unauthorizedResponse.statusCode === 403 ||
      unauthorizedResponse.statusCode === 404,
      'API requires authentication',
      unauthorizedResponse
    );

  } catch (error) {
    console.error('Test failed with error:', error.message);
    printTestResult(false, 'Get my applications tests failed', { error: error.message });
  }
}

module.exports = {
  testGetMyApplications
};

// Run tests if called directly
if (require.main === module) {
  testGetMyApplications();
}