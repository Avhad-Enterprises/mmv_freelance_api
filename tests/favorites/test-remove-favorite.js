#!/usr/bin/env node

/**
 * Favorites Remove Freelancer API Test
 * Tests the DELETE /favorites/remove-freelancer endpoint
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
 * Ensure a freelancer is in favorites for testing removal
 */
async function ensureFreelancerInFavorites() {
  try {
    console.log('💾 Ensuring freelancer is in favorites for testing...');
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/favorites/add-freelancer`, {
      freelancer_id: 2
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });

    if (response.statusCode === 201 || response.statusCode === 409) {
      console.log('✅ Freelancer is in favorites (either just added or already exists)');
      return true;
    }
    console.log('⚠️  Could not add freelancer to favorites, but continuing with tests');
    return false;
  } catch (error) {
    console.log('⚠️  Error ensuring freelancer in favorites:', error.message);
    return false;
  }
}

/**
 * Test removing a freelancer from favorites
 */
async function testRemoveFavorite() {
  printSection('Testing Remove Freelancer from Favorites');

  // Test 1: Remove favorite without auth
  console.log('Test 1: Remove favorite without authentication');
  console.log('📤 Request: DELETE /favorites/remove-freelancer');
  console.log('📦 Body:', { freelancer_id: 2 });
  console.log('🔑 Auth: None');
  
  const response1 = await makeRequest('DELETE', `${CONFIG.apiVersion}/favorites/remove-freelancer`, {
    freelancer_id: 2
  });
  
  console.log('📥 Response Status:', response1.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response1.body, null, 2));

  const test1Passed = response1.statusCode === 401;
  printTestResult('Remove favorite without auth', test1Passed, `Status: ${response1.statusCode}, Expected: 401`, response1);
  if (test1Passed) passedTests++; else failedTests++;

  // Test 2: Remove favorite with valid data and auth
  console.log('\nTest 2: Remove favorite with valid data and authentication');
  console.log('🔄 First ensuring freelancer is in favorites...');
  
  try {
    const ensureAdded = await makeRequest('POST', `${CONFIG.apiVersion}/favorites/add-freelancer`, {
      freelancer_id: 2
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });
    console.log('📥 Ensure added response:', { status: ensureAdded.statusCode, message: ensureAdded.body?.message });
    
    if (ensureAdded.statusCode === 409) {
      console.log('✅ Freelancer already in favorites, proceeding with remove test...');
    } else if (ensureAdded.statusCode === 201) {
      console.log('✅ Freelancer added successfully, proceeding with remove test...');
    }
  } catch (error) {
    console.log('⚠️  Error ensuring freelancer in favorites:', error.message);
    console.log('⚠️  Proceeding with remove test anyway...');
  }

  console.log('📤 Request: DELETE /favorites/remove-freelancer');
  console.log('📦 Body:', { freelancer_id: 2 });
  console.log('🔑 Auth: Bearer token (client)');
  
  let response2;
  try {
    response2 = await makeRequest('DELETE', `${CONFIG.apiVersion}/favorites/remove-freelancer`, {
      freelancer_id: 2
    }, {
      'Authorization': `Bearer ${TOKENS.client}`
    });
    console.log('📥 Response Status:', response2.statusCode);
    console.log('📥 Response Body:', JSON.stringify(response2.body, null, 2));
  } catch (error) {
    console.log('❌ Error during remove request:', error.message);
    response2 = { statusCode: 500, body: { message: error.message } };
  }
  
  const test2Passed = response2.statusCode === 200 && response2.body?.success === true;
  printTestResult('Remove favorite with valid data and auth', test2Passed, `Status: ${response2.statusCode}, Expected: 200`, response2);
  if (test2Passed) passedTests++; else failedTests++;

  // Test 3: Remove same freelancer again (should return 404)
  console.log('\nTest 3: Remove same freelancer again (should return 404)');
  console.log('📤 Request: DELETE /favorites/remove-freelancer');
  console.log('📦 Body:', { freelancer_id: 2 });
  console.log('🔑 Auth: Bearer token (client)');
  
  const response3 = await makeRequest('DELETE', `${CONFIG.apiVersion}/favorites/remove-freelancer`, {
    freelancer_id: 2
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response3.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response3.body, null, 2));

  const test3Passed = response3.statusCode === 404;
  printTestResult('Remove same freelancer again', test3Passed, `Status: ${response3.statusCode}, Expected: 404`, response3);
  if (test3Passed) passedTests++; else failedTests++;

  // Test 4: Remove favorite with missing required field
  console.log('\nTest 4: Remove favorite with missing required field');
  console.log('📤 Request: DELETE /favorites/remove-freelancer');
  console.log('📦 Body:', {});
  console.log('🔑 Auth: Bearer token (client)');
  
  const response4 = await makeRequest('DELETE', `${CONFIG.apiVersion}/favorites/remove-freelancer`, {
    // Missing freelancer_id
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response4.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response4.body, null, 2));

  const test4Passed = response4.statusCode === 400;
  printTestResult('Remove favorite with missing field', test4Passed, `Status: ${response4.statusCode}, Expected: 400`, response4);
  if (test4Passed) passedTests++; else failedTests++;

  // Test 5: Remove favorite with non-existent freelancer ID
  console.log('\nTest 5: Remove favorite with non-existent freelancer ID');
  console.log('📤 Request: DELETE /favorites/remove-freelancer');
  console.log('📦 Body:', { freelancer_id: 99999 });
  console.log('🔑 Auth: Bearer token (client)');
  
  const response5 = await makeRequest('DELETE', `${CONFIG.apiVersion}/favorites/remove-freelancer`, {
    freelancer_id: 99999
  }, {
    'Authorization': `Bearer ${TOKENS.client}`
  });
  
  console.log('📥 Response Status:', response5.statusCode);
  console.log('📥 Response Body:', JSON.stringify(response5.body, null, 2));

  const test5Passed = response5.statusCode === 404;
  printTestResult('Remove non-existent favorite', test5Passed, `Status: ${response5.statusCode}, Expected: 404`, response5);
  if (test5Passed) passedTests++; else failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 FAVORITES REMOVE FREELANCER API TESTS');
  console.log('=====================================\n');

  // Login first
  const loginSuccess = await loginAsClient();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without client authentication');
    process.exit(1);
  }

  // Run tests
  await testRemoveFavorite();

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
