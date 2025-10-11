const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetMyApplicationByProjectId() {
  printSection('Testing GET /applications/my-applications/project/:project_id');

  try {
    // Test 1: Videographer retrieves application for a specific project
    console.log('\nTest 1: Videographer retrieves application for project they applied to');
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

    // Get application for project ID 1 (which they applied to)
    const getApplicationResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/my-applications/project/1`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    console.log('Get application by project response:', JSON.stringify(getApplicationResponse, null, 2));

    printTestResult(
      getApplicationResponse.statusCode === 200 &&
      getApplicationResponse.body.data,
      'Videographer can retrieve their application for a specific project',
      getApplicationResponse
    );

    // Test 2: Video editor retrieves application for a specific project
    console.log('\nTest 2: Video editor retrieves application for project they applied to');
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

    // Get application for project ID 2 (which they applied to)
    const getEditorApplicationResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/my-applications/project/2`,
      null,
      authHeader('VIDEO_EDITOR')
    );

    console.log('Get editor application by project response:', JSON.stringify(getEditorApplicationResponse, null, 2));

    printTestResult(
      getEditorApplicationResponse.statusCode === 200 &&
      getEditorApplicationResponse.body.data,
      'Video editor can retrieve their application for a specific project',
      getEditorApplicationResponse
    );

    // Test 3: Attempt to get application for project they didn't apply to
    console.log('\nTest 3: Attempt to get application for project not applied to');
    const noApplicationResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/my-applications/project/999`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    console.log('No application response:', JSON.stringify(noApplicationResponse, null, 2));

    printTestResult(
      noApplicationResponse.statusCode === 200 ||
      noApplicationResponse.statusCode === 404,
      'API handles requests for projects user did not apply to',
      noApplicationResponse
    );

  } catch (error) {
    console.error('Test failed with error:', error.message);
    printTestResult(false, 'Get my application by project ID tests failed', { error: error.message });
  }
}

module.exports = {
  testGetMyApplicationByProjectId
};

// Run tests if called directly
if (require.main === module) {
  testGetMyApplicationByProjectId();
}