const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetCompletedProjects() {
  printSection('Testing GET /applications/filter/completed');

  try {
    // Test 1: Get completed projects as videographer
    console.log('\nTest 1: Get completed projects as videographer');
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

    const videographerCompletedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/filter/completed`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (videographerCompletedResponse.statusCode === 200) {
      const videographerCompletedData = processApiResponse(videographerCompletedResponse);
      printTestResult('Get completed projects as videographer', true, 'Successfully retrieved completed projects', {
        userId: videographerLoginData.data.user_id,
        count: videographerCompletedData.data ? videographerCompletedData.data.length : 0,
        response: videographerCompletedData
      });
    } else {
      printTestResult('Get completed projects as videographer', false, 'Failed to get completed projects', {
        statusCode: videographerCompletedResponse.statusCode,
        body: videographerCompletedResponse.body
      });
    }

    // Test 2: Get completed projects as video editor
    console.log('\nTest 2: Get completed projects as video editor');
    const videoEditorEmail = 'test.videoeditor@example.com';
    const videoEditorPassword = 'TestPass123!';

    const videoEditorLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: videoEditorEmail, password: videoEditorPassword }
    );
    const videoEditorLoginData = processApiResponse(videoEditorLoginResponse);
    storeToken('VIDEO_EDITOR', videoEditorLoginData.data.token);

    console.log('✅ Video editor login successful');

    const videoEditorCompletedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/filter/completed`,
      null,
      authHeader('VIDEO_EDITOR')
    );

    if (videoEditorCompletedResponse.statusCode === 200) {
      const videoEditorCompletedData = processApiResponse(videoEditorCompletedResponse);
      printTestResult('Get completed projects as video editor', true, 'Successfully retrieved completed projects', {
        userId: videoEditorLoginData.data.user_id,
        count: videoEditorCompletedData.data ? videoEditorCompletedData.data.length : 0,
        response: videoEditorCompletedData
      });
    } else {
      printTestResult('Get completed projects as video editor', false, 'Failed to get completed projects', {
        statusCode: videoEditorCompletedResponse.statusCode,
        body: videoEditorCompletedResponse.body
      });
    }

    // Test 3: Get completed projects as client
    console.log('\nTest 3: Get completed projects as client');
    const clientEmail = 'test.client@example.com';
    const clientPassword = 'TestPass123!';

    const clientLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: clientEmail, password: clientPassword }
    );
    const clientLoginData = processApiResponse(clientLoginResponse);
    storeToken('CLIENT', clientLoginData.data.token);

    console.log('✅ Client login successful');

    const clientCompletedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/filter/completed`,
      null,
      authHeader('CLIENT')
    );

    if (clientCompletedResponse.statusCode === 200) {
      const clientCompletedData = processApiResponse(clientCompletedResponse);
      printTestResult('Get completed projects as client', true, 'Successfully retrieved completed projects', {
        userId: clientLoginData.data.user_id,
        count: clientCompletedData.data ? clientCompletedData.data.length : 0,
        response: clientCompletedData
      });
    } else {
      printTestResult('Get completed projects as client', false, 'Failed to get completed projects', {
        statusCode: clientCompletedResponse.statusCode,
        body: clientCompletedResponse.body
      });
    }

    // Test 4: Get completed projects as admin
    console.log('\nTest 4: Get completed projects as admin');
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

    const adminCompletedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/filter/completed`,
      null,
      authHeader('SUPER_ADMIN')
    );

    if (adminCompletedResponse.statusCode === 200) {
      const adminCompletedData = processApiResponse(adminCompletedResponse);
      printTestResult('Get completed projects as admin', true, 'Successfully retrieved completed projects', {
        userId: adminLoginData.data.user_id,
        count: adminCompletedData.data ? adminCompletedData.data.length : 0,
        response: adminCompletedData
      });
    } else {
      printTestResult('Get completed projects as admin', false, 'Failed to get completed projects', {
        statusCode: adminCompletedResponse.statusCode,
        body: adminCompletedResponse.body
      });
    }

    // Test 5: Try invalid filter (should fail)
    console.log('\nTest 5: Try invalid filter (should fail)');
    const invalidFilterResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/filter/invalid`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (invalidFilterResponse.statusCode === 400) {
      printTestResult('Invalid filter validation', true, 'Correctly rejected invalid filter', { statusCode: 400 });
    } else {
      printTestResult('Invalid filter validation', false, 'Should have rejected invalid filter', {
        statusCode: invalidFilterResponse.statusCode,
        body: invalidFilterResponse.body
      });
    }

    // Test 6: Try to access without authentication (should fail)
    console.log('\nTest 6: Access without authentication (should fail)');
    const unauthenticatedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/filter/completed`,
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
    console.error('Error during completed projects test:', error.message);
    printTestResult('Completed projects test', false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testGetCompletedProjects
};

// Run tests if called directly
if (require.main === module) {
  testGetCompletedProjects();
}