const {
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  authHeader,
  storeToken,
} = require('../test-utils');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testUpdateApplicationStatus() {
  printSection('Testing PATCH /applications/update-status');

  try {
    // Login as client
    console.log('\nLogging in as client...');
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

    // Get existing applications to find one to update
    console.log('\nGetting existing applications...');
    const getApplicationsResponse = await makeRequest(
      'GET',
      `${BASE_URL}/applications/projects/1/applications`,
      null,
      authHeader('CLIENT')
    );

    let applicationId = null;
    if (getApplicationsResponse.statusCode === 200) {
      const applicationsData = processApiResponse(getApplicationsResponse);
      if (applicationsData.data && applicationsData.data.length > 0) {
        // Find an application with status 0 (pending)
        const pendingApp = applicationsData.data.find(app => app.status === 0);
        if (pendingApp) {
          applicationId = pendingApp.applied_projects_id;
          console.log(`Found pending application: ${applicationId}`);
        } else {
          // Use the first application available
          applicationId = applicationsData.data[0].applied_projects_id;
          console.log(`Using existing application: ${applicationId} (status: ${applicationsData.data[0].status})`);
        }
      }
    }

    if (!applicationId) {
      // Create a new application for testing
      console.log('No existing applications found, creating a new one...');

      // Login as videographer to apply
      const videographerEmail = 'test.videographer@example.com';
      const videographerPassword = 'TestPass123!';

      const videographerLoginResponse = await makeRequest(
        'POST',
        `${BASE_URL}/auth/login`,
        { email: videographerEmail, password: videographerPassword }
      );
      const videographerLoginData = processApiResponse(videographerLoginResponse);
      storeToken('VIDEOGRAPHER', videographerLoginData.data.token);

      // Apply to project
      const applyResponse = await makeRequest(
        'POST',
        `${BASE_URL}/applications/projects/apply`,
        { projects_task_id: 1, user_id: 45 },
        authHeader('VIDEOGRAPHER')
      );

      if (applyResponse.statusCode === 200) {
        const applyData = processApiResponse(applyResponse);
        applicationId = applyData.data.applied_projects_id;
        console.log(`Created new application: ${applicationId}`);

        // Switch back to client token
        storeToken('CLIENT', clientLoginData.data.token);
      } else {
        printTestResult(false, 'Could not create test application', { statusCode: applyResponse.statusCode });
        return;
      }
    }

    // Test 1: Update application status to 1 (ongoing/hired)
    console.log('\nTest 1: Update application status to hired (1)');
    const updateStatusResponse = await makeRequest(
      'PATCH',
      `${BASE_URL}/applications/update-status`,
      {
        applied_projects_id: applicationId,
        status: 1
      },
      authHeader('CLIENT')
    );

    if (updateStatusResponse.statusCode === 200) {
      const updateData = processApiResponse(updateStatusResponse);
      printTestResult(true, 'Successfully updated application status to hired', {
        applicationId,
        newStatus: 1,
        updated: updateData.data
      });
    } else {
      printTestResult(false, 'Failed to update application status', {
        statusCode: updateStatusResponse.statusCode,
        body: updateStatusResponse.body
      });
    }

    // Test 2: Update application status to 2 (completed)
    console.log('\nTest 2: Update application status to completed (2)');
    const completeStatusResponse = await makeRequest(
      'PATCH',
      `${BASE_URL}/applications/update-status`,
      {
        applied_projects_id: applicationId,
        status: 2
      },
      authHeader('CLIENT')
    );

    if (completeStatusResponse.statusCode === 200) {
      const completeData = processApiResponse(completeStatusResponse);
      printTestResult(true, 'Successfully updated application status to completed', {
        applicationId,
        newStatus: 2,
        updated: completeData.data
      });
    } else {
      printTestResult(false, 'Failed to update application status to completed', {
        statusCode: completeStatusResponse.statusCode,
        body: completeStatusResponse.body
      });
    }

    // Test 3: Try to update non-existent application
    console.log('\nTest 3: Try to update non-existent application');
    const nonExistentResponse = await makeRequest(
      'PATCH',
      `${BASE_URL}/applications/update-status`,
      {
        applied_projects_id: 999999,
        status: 1
      },
      authHeader('CLIENT')
    );

    if (nonExistentResponse.statusCode === 404) {
      // For 404 errors, we don't call processApiResponse as it throws an error
      printTestResult(true, 'Correctly handled non-existent application', { statusCode: 404 });
    } else {
      printTestResult(false, 'Should have returned 404 for non-existent application', {
        statusCode: nonExistentResponse.statusCode,
        body: nonExistentResponse.body
      });
    }

    // Test 4: Try to update without required parameters
    console.log('\nTest 4: Try to update without required parameters');
    const missingParamsResponse = await makeRequest(
      'PATCH',
      `${BASE_URL}/applications/update-status`,
      { status: 1 }, // Missing applied_projects_id
      authHeader('CLIENT')
    );

    if (missingParamsResponse.statusCode === 400) {
      // For 400 errors, we don't call processApiResponse as it throws an error
      printTestResult(true, 'Correctly rejected request with missing parameters', { statusCode: 400 });
    } else {
      printTestResult(false, 'Should have rejected request with missing parameters', {
        statusCode: missingParamsResponse.statusCode,
        body: missingParamsResponse.body
      });
    }

    // Test 5: Try to access without CLIENT role
    console.log('\nTest 5: Access without CLIENT role (should fail)');
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
      'PATCH',
      `${BASE_URL}/applications/update-status`,
      {
        applied_projects_id: applicationId,
        status: 1
      },
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
    console.error('Error during update status test:', error.message);
    printTestResult(false, 'Test failed with exception', { error: error.message });
  }
}

module.exports = {
  testUpdateApplicationStatus
};

// Run tests if called directly
if (require.main === module) {
  testUpdateApplicationStatus();
}