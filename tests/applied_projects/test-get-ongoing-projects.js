const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetOngoingProjects() {
  printSection('Testing GET /applications/ongoing');

  try {
    // Test 1: Get ongoing projects as videographer
    console.log('\nTest 1: Get ongoing projects as videographer');
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

    const videographerOngoingResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/ongoing`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (videographerOngoingResponse.statusCode === 200) {
      const videographerOngoingData = processApiResponse(videographerOngoingResponse);
      printTestResult('Get ongoing projects as videographer', true, 'Successfully retrieved ongoing projects', {
        userId: videographerLoginData.data.user_id,
        count: videographerOngoingData.data ? videographerOngoingData.data.length : 0,
        response: videographerOngoingData
      });
    } else {
      printTestResult('Get ongoing projects as videographer', false, 'Failed to get ongoing projects', {
        statusCode: videographerOngoingResponse.statusCode,
        body: videographerOngoingResponse.body
      });
    }

    // Test 2: Get ongoing projects as video editor
    console.log('\nTest 2: Get ongoing projects as video editor');
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

    const videoEditorOngoingResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/ongoing`,
      null,
      authHeader('VIDEO_EDITOR')
    );

    if (videoEditorOngoingResponse.statusCode === 200) {
      const videoEditorOngoingData = processApiResponse(videoEditorOngoingResponse);
      printTestResult('Get ongoing projects as video editor', true, 'Successfully retrieved ongoing projects', {
        userId: videoEditorLoginData.data.user_id,
        count: videoEditorOngoingData.data ? videoEditorOngoingData.data.length : 0,
        response: videoEditorOngoingData
      });
    } else {
      printTestResult('Get ongoing projects as video editor', false, 'Failed to get ongoing projects', {
        statusCode: videoEditorOngoingResponse.statusCode,
        body: videoEditorOngoingResponse.body
      });
    }

    // Test 3: Get ongoing projects as client
    console.log('\nTest 3: Get ongoing projects as client');
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

    const clientOngoingResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/ongoing`,
      null,
      authHeader('CLIENT')
    );

    if (clientOngoingResponse.statusCode === 200) {
      const clientOngoingData = processApiResponse(clientOngoingResponse);
      printTestResult('Get ongoing projects as client', true, 'Successfully retrieved ongoing projects', {
        userId: clientLoginData.data.user_id,
        count: clientOngoingData.data ? clientOngoingData.data.length : 0,
        response: clientOngoingData
      });
    } else {
      printTestResult('Get ongoing projects as client', false, 'Failed to get ongoing projects', {
        statusCode: clientOngoingResponse.statusCode,
        body: clientOngoingResponse.body
      });
    }

    // Test 4: Get ongoing projects as admin
    console.log('\nTest 4: Get ongoing projects as admin');
    const adminEmail = 'superadmin@mmv.com';
    const adminPassword = 'SuperAdmin123!';

    const adminLoginResponse = await makeRequest(
      'POST',
      `${BASE_URL}/auth/login`,
      { email: adminEmail, password: adminPassword }
    );
    const adminLoginData = processApiResponse(adminLoginResponse);
    storeToken('SUPER_ADMIN', adminLoginData.data.token);

    console.log('✅ Admin login successful');

    const adminOngoingResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/ongoing`,
      null,
      authHeader('SUPER_ADMIN')
    );

    if (adminOngoingResponse.statusCode === 200) {
      const adminOngoingData = processApiResponse(adminOngoingResponse);
      printTestResult('Get ongoing projects as admin', true, 'Successfully retrieved ongoing projects', {
        userId: adminLoginData.data.user_id,
        count: adminOngoingData.data ? adminOngoingData.data.length : 0,
        response: adminOngoingData
      });
    } else {
      printTestResult('Get ongoing projects as admin', false, 'Failed to get ongoing projects', {
        statusCode: adminOngoingResponse.statusCode,
        body: adminOngoingResponse.body
      });
    }

    // Test 5: Try to access without authentication (should fail)
    console.log('\nTest 5: Access without authentication (should fail)');
    const unauthenticatedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/ongoing`,
      null,
      {} // No auth header
    );

    if (unauthenticatedResponse.statusCode === 404) {
      printTestResult('Unauthenticated access check', true, 'Correctly denied access without authentication', { statusCode: 404 });
    } else {
      printTestResult('Unauthenticated access check', false, 'Should have denied access without authentication', {
        statusCode: unauthenticatedResponse.statusCode,
        body: unauthenticatedResponse.body
      });
    }

  } catch (error) {
    console.error('Error during ongoing projects test:', error.message);
    printTestResult('Ongoing projects test', false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testGetOngoingProjects
};

// Run tests if called directly
if (require.main === module) {
  testGetOngoingProjects();
}