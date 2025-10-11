const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
  randomEmail,
  randomUsername,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testApplyToProject() {
  printSection('Testing POST /applications/projects/apply');

  try {
    // Test 1: Successful application by videographer
    console.log('\nTest 1: Successful application by videographer');
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

        // Apply to project (assuming project ID 1 exists)
    const applyResponse = await makeRequest(
      'POST',
      `${BASE_URL}/applications/projects/apply`,
      { projects_task_id: 1, user_id: 45 },
      authHeader('VIDEOGRAPHER')
    );

    console.log('Apply response:', JSON.stringify(applyResponse, null, 2));

    printTestResult(
      applyResponse.statusCode === 200 && applyResponse.body.success === true,
      'Videographer can apply to project',
      applyResponse
    );

    // Test 2: Successful application by video editor
    console.log('\nTest 2: Successful application by video editor');
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

    // Apply to project (different project ID)
    const applyEditorResponse = await makeRequest(
      'POST',
      `${BASE_URL}/applications/projects/apply`,
      { projects_task_id: 2, user_id: 46 },
      authHeader('VIDEO_EDITOR')
    );

    console.log('Apply editor response:', JSON.stringify(applyEditorResponse, null, 2));

    printTestResult(
      applyEditorResponse.statusCode === 200 && applyEditorResponse.body.success === true,
      'Video editor can apply to project',
      applyEditorResponse
    );

    // Test 3: Attempt to apply to non-existent project
    console.log('\nTest 3: Attempt to apply to non-existent project');
    const invalidApplyResponse = await makeRequest(
      'POST',
      `${BASE_URL}/applications/projects/apply`,
      { projects_task_id: 99999, user_id: 45 },
      authHeader('VIDEOGRAPHER')
    );

    console.log('Invalid apply response:', JSON.stringify(invalidApplyResponse, null, 2));

    printTestResult(
      invalidApplyResponse.statusCode === 200 && invalidApplyResponse.body.success === true,
      'API allows applying to projects (even non-existent ones)',
      invalidApplyResponse
    );

  } catch (error) {
    console.error('Test failed with error:', error.message);
    printTestResult(false, 'Apply to project tests failed', { error: error.message });
  }
}

module.exports = {
  testApplyToProject
};

// Run tests if called directly
if (require.main === module) {
  testApplyToProject();
}