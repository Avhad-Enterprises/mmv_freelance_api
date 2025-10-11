const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testGetAppliedCount() {
  printSection('Testing GET /applications/count');

  try {
    // Test 1: Get applied count as videographer
    console.log('\nTest 1: Get applied count as videographer');
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

    const videographerCountResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/count`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (videographerCountResponse.statusCode === 200) {
      const videographerCountData = processApiResponse(videographerCountResponse);
      printTestResult('Get applied count as videographer', true, 'Successfully retrieved applied count', {
        userId: videographerLoginData.data.user_id,
        count: videographerCountData.data,
        response: videographerCountData
      });
    } else {
      printTestResult('Get applied count as videographer', false, 'Failed to get applied count', {
        statusCode: videographerCountResponse.statusCode,
        body: videographerCountResponse.body
      });
    }

    // Test 2: Get applied count as video editor
    console.log('\nTest 2: Get applied count as video editor');
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

    const videoEditorCountResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/count`,
      null,
      authHeader('VIDEO_EDITOR')
    );

    if (videoEditorCountResponse.statusCode === 200) {
      const videoEditorCountData = processApiResponse(videoEditorCountResponse);
      printTestResult('Get applied count as video editor', true, 'Successfully retrieved applied count', {
        userId: videoEditorLoginData.data.user_id,
        count: videoEditorCountData.data,
        response: videoEditorCountData
      });
    } else {
      printTestResult('Get applied count as video editor', false, 'Failed to get applied count', {
        statusCode: videoEditorCountResponse.statusCode,
        body: videoEditorCountResponse.body
      });
    }

    // Test 3: Get applied count as admin
    console.log('\nTest 3: Get applied count as admin');
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

    const adminCountResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/count`,
      null,
      authHeader('SUPER_ADMIN')
    );

    if (adminCountResponse.statusCode === 200) {
      const adminCountData = processApiResponse(adminCountResponse);
      printTestResult('Get applied count as admin', true, 'Successfully retrieved applied count', {
        userId: adminLoginData.data.user_id,
        count: adminCountData.data,
        response: adminCountData
      });
    } else {
      printTestResult('Get applied count as admin', false, 'Failed to get applied count', {
        statusCode: adminCountResponse.statusCode,
        body: adminCountResponse.body
      });
    }

    // Test 4: Try to access without authentication (should fail)
    console.log('\nTest 4: Access without authentication (should fail)');
    const unauthenticatedResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/count`,
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

    // Test 5: Try to access with unauthorized role (should fail)
    console.log('\nTest 5: Access with unauthorized role (should fail)');
    const clientEmail = 'harshalv4@gmail.com';
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
      `${BASE_URL}/applications/count`,
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

  } catch (error) {
    console.error('Error during applied count test:', error.message);
    printTestResult('Applied count test', false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testGetAppliedCount
};

// Run tests if called directly
if (require.main === module) {
  testGetAppliedCount();
}