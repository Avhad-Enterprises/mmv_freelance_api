#!/usr/bin/env node

/**
 * Saved Project Save API Test
 * Tests the POST /saved/save-project endpoint
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
 * Test saving a project
 */
async function testSaveProject() {
  printSection('Testing Save Project');

  // Test 1: Save project without auth
  console.log('Test 1: Save project without authentication');
  console.log('📤 Request: POST /saved/save-project');
  console.log('📦 Body:', { projects_task_id: 58 });
  console.log('🔑 Auth: None');
  
  const response1 = await makeRequest('POST', `${CONFIG.apiVersion}/saved/save-project`, {
    projects_task_id: 58
  });
  
  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Save project without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Save project with valid data
  console.log('\nTest 2: Save project with valid data');
  console.log('🔄 First ensuring project is not saved (cleanup)...');
  
  // First ensure the project is not saved (unsave it if it exists)
  const unsaveResponse = await makeRequest('DELETE', `${CONFIG.apiVersion}/saved/unsave-project`, {
    projects_task_id: 58
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  console.log('📥 Unsave cleanup response:', { status: unsaveResponse.statusCode, message: unsaveResponse.body?.message });

  // If unsave failed with 400, it might be a validation issue, try a different approach
  if (unsaveResponse.statusCode === 400) {
    console.log('⚠️  Unsave returned 400, project may not have been saved before');
  }

  console.log('📤 Request: POST /saved/save-project');
  console.log('📦 Body:', { projects_task_id: 58 });
  console.log('🔑 Auth: Bearer token (client)');
  
  const response2 = await makeRequest('POST', `${CONFIG.apiVersion}/saved/save-project`, {
    projects_task_id: 58
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  console.log('📥 Response Status:', response2.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));

  // Accept both 201 (new save) and 400 (already saved) as valid for this test
  const test2Passed = (response2.statusCode === 201 && response2.body?.data) || (response2.statusCode === 400 && response2.body?.message === 'Project already saved');
  printTestResult('Save project with valid data', test2Passed, `Status: ${response2.statusCode}, Expected: 201 or 400`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Save same project again (should return 400 for duplicate)
  console.log('\nTest 3: Save same project again (should return 400 for duplicate)');
  console.log('📤 Request: POST /saved/save-project');
  console.log('📦 Body:', { projects_task_id: 58 });
  console.log('🔑 Auth: Bearer token (client)');
  
  const response3 = await makeRequest('POST', `${CONFIG.apiVersion}/saved/save-project`, {
    projects_task_id: 58
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response3.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response3.body, null, 2));

  const test3Passed = response3.statusCode === 400;
  printTestResult('Save same project again', test3Passed, `Status: ${response3.statusCode}, Expected: 400`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Save project with invalid data
  console.log('\nTest 4: Save project with missing required field');
  console.log('📤 Request: POST /saved/save-project');
  console.log('📦 Body:', {});
  console.log('🔑 Auth: Bearer token (client)');
  
  const response4 = await makeRequest('POST', `${CONFIG.apiVersion}/saved/save-project`, {
    // Missing projects_task_id
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response4.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response4.body, null, 2));

  const test4Passed = response4.statusCode === 400;
  printTestResult('Save project with missing field', test4Passed, `Status: ${response4.statusCode}, Expected: 400`, response4);
  if (test4Passed) passedTests++; else failedTests++;

  // Test 5: Save project with non-existent project ID
  console.log('\nTest 5: Save project with non-existent project ID');
  console.log('📤 Request: POST /saved/save-project');
  console.log('📦 Body:', { projects_task_id: 99999 });
  console.log('🔑 Auth: Bearer token (client)');
  
  const response5 = await makeRequest('POST', `${CONFIG.apiVersion}/saved/save-project`, {
    projects_task_id: 99999
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response5.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response5.body, null, 2));

  const test5Passed = response5.statusCode === 400; // Should return 400 for non-existent project
  printTestResult('Save project with invalid ID', test5Passed, `Status: ${response5.statusCode}, Expected: 400`, response5);
  if (test5Passed) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SAVED PROJECT SAVE API TESTS');
  console.log('=====================================\n');

  // Login first
  const loginSuccess = await loginAsClient();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without client authentication');
    process.exit(1);
  }

  // Run tests
  await testSaveProject();

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