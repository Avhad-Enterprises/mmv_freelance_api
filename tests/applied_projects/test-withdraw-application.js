const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testWithdrawApplication() {
  printSection('Testing DELETE /applications/withdraw/:application_id');

  try {
    // First, let's apply to a project to get an application ID
    console.log('\nFirst, applying to a project to get an application ID...');
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

    // Apply to a project to get a fresh application ID for testing
    const applyResponse = await makeRequest(
      'POST',
      `${BASE_URL}/applications/projects/apply`,
      {
        projects_task_id: 3, // Use project ID 3 to avoid conflicts
        description: "Test application for withdrawal testing"
      },
      authHeader('VIDEOGRAPHER')
    );

    let applicationId;
    if (applyResponse.statusCode === 201 || applyResponse.statusCode === 200) {
      const applyData = processApiResponse(applyResponse);
      applicationId = applyData.data.applied_projects_id;
      console.log(`✅ Created fresh application for testing, ID: ${applicationId}`);
    } else {
      console.log('❌ Could not create fresh application for testing, checking response...');
      console.log('Apply response status:', applyResponse.statusCode);
      console.log('Apply response body:', applyResponse.body);
      return;
    }

    // Test 1: Withdraw application successfully
    console.log('\nTest 1: Withdraw application successfully');
    const withdrawResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/${applicationId}`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (withdrawResponse.statusCode === 200) {
      const withdrawData = processApiResponse(withdrawResponse);
      printTestResult('Withdraw application successfully', true, 'Successfully withdrew application', {
        applicationId,
        response: withdrawData
      });
    } else {
      printTestResult('Withdraw application successfully', false, 'Failed to withdraw application', {
        statusCode: withdrawResponse.statusCode,
        body: withdrawResponse.body
      });
    }

    // Test 2: Try to withdraw the same application again (should fail)
    console.log('\nTest 2: Try to withdraw the same application again (should fail)');
    const withdrawAgainResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/${applicationId}`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (withdrawAgainResponse.statusCode === 400) {
      printTestResult('Withdraw already withdrawn application', true, 'Correctly rejected withdrawal of already withdrawn application', { statusCode: 400 });
    } else {
      printTestResult('Withdraw already withdrawn application', false, 'Should have rejected withdrawal of already withdrawn application', {
        statusCode: withdrawAgainResponse.statusCode,
        body: withdrawAgainResponse.body
      });
    }

    // Test 3: Try to withdraw non-existent application (should fail)
    console.log('\nTest 3: Try to withdraw non-existent application (should fail)');
    const nonExistentId = 999999;
    const nonExistentResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/${nonExistentId}`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (nonExistentResponse.statusCode === 404) {
      printTestResult('Withdraw non-existent application', true, 'Correctly rejected withdrawal of non-existent application', { statusCode: 404 });
    } else {
      printTestResult('Withdraw non-existent application', false, 'Should have rejected withdrawal of non-existent application', {
        statusCode: nonExistentResponse.statusCode,
        body: nonExistentResponse.body
      });
    }

    // Test 4: Try to withdraw with invalid application_id format (should fail)
    console.log('\nTest 4: Try to withdraw with invalid application_id format (should fail)');
    const invalidIdResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/abc`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (invalidIdResponse.statusCode === 400) {
      printTestResult('Withdraw with invalid application_id', true, 'Correctly rejected withdrawal with invalid application_id', { statusCode: 400 });
    } else {
      printTestResult('Withdraw with invalid application_id', false, 'Should have rejected withdrawal with invalid application_id', {
        statusCode: invalidIdResponse.statusCode,
        body: invalidIdResponse.body
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
      'DELETE',
      `${BASE_URL}/applications/withdraw/${applicationId}`,
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

    // Test 6: Try to access without authentication (should fail)
    console.log('\nTest 6: Access without authentication (should fail)');
    const unauthenticatedResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/${applicationId}`,
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
    console.error('Error during withdraw application test:', error.message);
    printTestResult('Withdraw application test', false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testWithdrawApplication
};

// Run tests if called directly
if (require.main === module) {
  testWithdrawApplication();
}