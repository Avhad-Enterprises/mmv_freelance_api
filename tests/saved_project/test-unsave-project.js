#!/usr/bin/env node

/**
 * Saved Project Unsave API Test
 * Tests the DELETE /saved/unsave-project endpoint
 */

const {
  CONFIG,
  makeRequest,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  TOKENS,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Login and get client token
 */
async function loginAsClient() {
  try {
    console.log('🔐 Logging in as client...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
      email: 'test.client@example.com',
      password: 'TestPass123!'
    });

    if (response.statusCode === 200 && response.body?.data?.token) {
      storeToken('client', response.body.data.token);
      console.log('✅ Client token stored');
      return true;
    }
    console.log('❌ Login failed');
    return false;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

/**
 * Save a project first for testing unsave
 */
async function saveProjectForTesting() {
  try {
    console.log('💾 Saving a project for testing unsave...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/saved/save-project`, {
      projects_task_id: 58
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });    if (response.statusCode === 201 || response.statusCode === 400) {
      // 201 = successfully saved, 400 = already saved (duplicate)
      console.log('✅ Project is available for testing (either just saved or already saved)');
      return true;
    }
    console.log('⚠️ Could not save project, but continuing with tests');
    return false;
  } catch (error) {
    console.log('⚠️ Error saving project:', error.message);
    return false;
  }
}

/**
 * Test unsaving a project
 */
async function testUnsaveProject() {
  printSection('Testing Unsave Project');

  // First save a project for testing
  await saveProjectForTesting();

  // Test 1: Unsave project without auth
  console.log('Test 1: Unsave project without authentication');
  console.log('📤 Request: DELETE /saved/unsave-project');
  console.log('📦 Body:', { projects_task_id: 58 });
  console.log('🔑 Auth: None');
  
  const response1 = await makeRequest('DELETE', `${CONFIG.apiVersion}/saved/unsave-project`, {
    projects_task_id: 58
  });
  
  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Unsave project without auth', test1Passed, `Status: ${response1.statusCode}`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Unsave project with valid data
  console.log('\nTest 2: Unsave project with valid data');
  console.log('🔄 First ensuring project is saved...');
  
  // Ensure the project is saved first
  try {
    const ensureSaved = await makeRequest('POST', `${CONFIG.apiVersion}/saved/save-project`, {
      projects_task_id: 58
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });
    console.log('📥 Ensure saved response:', { status: ensureSaved.statusCode, message: ensureSaved.body?.message });
    
    // If already saved (400), that's fine, continue with the unsave test
    if (ensureSaved.statusCode === 400) {
      console.log('✅ Project already saved, proceeding with unsave test...');
    } else if (ensureSaved.statusCode === 201) {
      console.log('✅ Project saved successfully, proceeding with unsave test...');
    }
  } catch (error) {
    console.log('⚠️  Error ensuring project is saved:', error.message);
    console.log('⚠️  Proceeding with unsave test anyway...');
  }

  console.log('📤 Request: DELETE /saved/unsave-project');
  console.log('📦 Body:', { projects_task_id: 58 });
  console.log('🔑 Auth: Bearer token (client)');
  
  // DELETE request should have data in body, not query params
  let response2;
  try {
    response2 = await makeRequest('DELETE', `${CONFIG.apiVersion}/saved/unsave-project`, {
      projects_task_id: 58
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });
    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));
  } catch (error) {
    console.log('❌ Error during unsave request:', error.message);
    response2 = { statusCode: 500, body: { message: error.message } };
  }
  
  const test2Passed = response2.statusCode === 200 && response2.body?.success === true;
  printTestResult('Unsave project with valid data', test2Passed, `Status: ${response2.statusCode}`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Unsave same project again (should handle gracefully)
  console.log('\nTest 3: Unsave same project again (should return 404)');
  console.log('📤 Request: DELETE /saved/unsave-project');
  console.log('📦 Body:', { projects_task_id: 58 });
  console.log('🔑 Auth: Bearer token (client)');
  
  const response3 = await makeRequest('DELETE', `${CONFIG.apiVersion}/saved/unsave-project`, {
    projects_task_id: 58
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response3.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response3.body, null, 2));

  const test3Passed = response3.statusCode === 404;
  printTestResult('Unsave same project again', test3Passed, `Status: ${response3.statusCode}, Expected: 404`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Unsave project with invalid data
  console.log('\nTest 4: Unsave project with missing required field');
  console.log('📤 Request: DELETE /saved/unsave-project');
  console.log('📦 Body:', {});
  console.log('🔑 Auth: Bearer token (client)');
  
  const response4 = await makeRequest('DELETE', `${CONFIG.apiVersion}/saved/unsave-project`, {
    // Missing projects_task_id
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response4.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response4.body, null, 2));

  const test4Passed = response4.statusCode === 400;
  printTestResult('Unsave with missing field', test4Passed, `Status: ${response4.statusCode}, Expected: 400`, response4);
  if (test4Passed) passedTests++; else failedTests++;

  // Test 5: Unsave project with non-existent project ID
  console.log('\nTest 5: Unsave project with non-existent project ID');
  console.log('📤 Request: DELETE /saved/unsave-project');
  console.log('📦 Body:', { projects_task_id: 99999 });
  console.log('🔑 Auth: Bearer token (client)');
  
  const response5 = await makeRequest('DELETE', `${CONFIG.apiVersion}/saved/unsave-project`, {
    projects_task_id: 99999
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response5.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response5.body, null, 2));

  const test5Passed = response5.statusCode === 404;
  printTestResult('Unsave non-existent project', test5Passed, `Status: ${response5.statusCode}, Expected: 404`, response5);
  if (test5Passed) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SAVED PROJECT UNSAVE API TESTS');
  console.log('=====================================\n');

  // Login first
  const loginSuccess = await loginAsClient();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without client authentication');
    process.exit(1);
  }

  // Run tests
  await testUnsaveProject();

  // Print summary
  printSummary(passedTests, failedTests, passedTests + failedTests);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };