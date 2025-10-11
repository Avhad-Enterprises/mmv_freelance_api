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

  let applicationId;

  try {
    // Create a fresh application for testing withdrawal
    console.log('\nCreating a new application for withdrawal test...');
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

    // Apply to a new project to get a fresh application
    const applyResponse = await makeRequest(
      'POST',
      `${BASE_URL}/applications/projects/apply`,
      { projects_task_id: 999, user_id: 45 },
      authHeader('VIDEOGRAPHER')
    );

    if (applyResponse.statusCode !== 200) {
      console.log('Could not create test application, using existing one');
      // Get existing applications
      const getApplicationsResponse = await makeRequest(
        'GET',
        `${BASE_URL}/applications/my-applications`,
        null,
        authHeader('VIDEOGRAPHER')
      );
      const applications = processApiResponse(getApplicationsResponse);

      if (!applications.data || applications.data.length === 0) {
        console.log('No applications available for testing');
        printTestResult(false, 'No applications available for withdrawal test', { message: 'Need applications to test withdrawal' });
        return;
      }

      // Find an application that hasn't been withdrawn (is_deleted = false)
      const availableApp = applications.data.find(app => !app.is_deleted);
      if (!availableApp) {
        console.log('All applications have been withdrawn, cannot test withdrawal');
        printTestResult(false, 'All applications withdrawn', { message: 'Cannot test withdrawal functionality' });
        return;
      }

      applicationId = availableApp.applied_projects_id;
    } else {
      const applyData = processApiResponse(applyResponse);
      applicationId = applyData.data.applied_projects_id;
    }

    console.log(`Using application ID: ${applicationId} for withdrawal test`);

    // Test 1: Successful withdrawal
    console.log('\nTest 1: Successful withdrawal');
    const withdrawResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/${applicationId}`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (withdrawResponse.statusCode === 200) {
      const withdrawData = processApiResponse(withdrawResponse);
      printTestResult(true, 'Successful withdrawal', withdrawData);
    } else {
      printTestResult(false, 'Failed to withdraw application', { statusCode: withdrawResponse.statusCode, body: withdrawResponse.body });
    }

    // Test 2: Attempt to withdraw the same application again (should fail)
    console.log('\nTest 2: Attempt to withdraw already withdrawn application');
    const duplicateWithdrawResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/${applicationId}`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (duplicateWithdrawResponse.statusCode === 400) {
      // For 400 errors, we don't call processApiResponse as it throws an error
      printTestResult(true, 'Correctly rejected duplicate withdrawal', { statusCode: 400, message: 'Application already withdrawn' });
    } else {
      printTestResult(false, 'Should have rejected duplicate withdrawal', { statusCode: duplicateWithdrawResponse.statusCode, body: duplicateWithdrawResponse.body });
    }

    // Test 3: Attempt to withdraw non-existent application
    console.log('\nTest 3: Attempt to withdraw non-existent application');
    const nonExistentId = 999999;
    const nonExistentWithdrawResponse = await makeRequest(
      'DELETE',
      `${BASE_URL}/applications/withdraw/${nonExistentId}`,
      null,
      authHeader('VIDEOGRAPHER')
    );

    if (nonExistentWithdrawResponse.statusCode === 404) {
      // For 404 errors, we don't call processApiResponse as it throws an error
      printTestResult(true, 'Correctly handled non-existent application', { statusCode: 404, message: 'Application not found' });
    } else {
      printTestResult(false, 'Should have returned 404 for non-existent application', { statusCode: nonExistentWithdrawResponse.statusCode, body: nonExistentWithdrawResponse.body });
    }

  } catch (error) {
    console.error('Error during withdrawal test:', error.message);
    printTestResult(false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testWithdrawApplication
};

// Run tests if called directly
if (require.main === module) {
  testWithdrawApplication();
}