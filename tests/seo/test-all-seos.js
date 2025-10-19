#!/usr/bin/env node

/**
 * SEO All Tests
 * Runs all SEO API tests
 */

const createTests = require('./test-create-seo');
const getAllTests = require('./test-get-all-seos');
const getByIdTests = require('./test-get-seo-by-id');
const updateTests = require('./test-update-seo');
const deleteTests = require('./test-delete-seo');

let passedTests = 0;
let failedTests = 0;

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 SEO ALL API TESTS');
  console.log('====================\n');

  try {
    // Run all test suites
    console.log('🏃 Running Create SEO Tests...');
    await createTests.runTests();
    console.log('');

    console.log('🏃 Running Get All SEO Tests...');
    await getAllTests.runTests();
    console.log('');

    console.log('🏃 Running Get SEO by ID Tests...');
    await getByIdTests.runTests();
    console.log('');

    console.log('🏃 Running Update SEO Tests...');
    await updateTests.runTests();
    console.log('');

    console.log('🏃 Running Delete SEO Tests...');
    await deleteTests.runTests();
    console.log('');

    console.log('✅ All SEO test suites completed');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };

/**
 * Run all SEO API tests
 */
async function runAllSeoTests() {
  console.log('🚀 Starting Complete SEO API Test Suite');
  console.log('=========================================');

  const results = [];
  let totalTests = 0;
  let passedTests = 0;

  try {
    // Test Create SEO - Success
    console.log('\n📝 Running Create SEO Tests...');
    const createResult = await testCreateSeo();
    results.push({ suite: 'Create SEO - Success', ...createResult });
    totalTests += 1;
    if (createResult.success) passedTests += 1;

    // Test Create SEO - Invalid Data
    const createInvalidResult = await testCreateSeoInvalidData();
    results.push({ suite: 'Create SEO - Invalid Data', ...createInvalidResult });
    totalTests += 1;
    if (createInvalidResult.success) passedTests += 1;

    // Test Create SEO - No Auth
    const createNoAuthResult = await testCreateSeoNoAuth();
    results.push({ suite: 'Create SEO - No Auth', ...createNoAuthResult });
    totalTests += 1;
    if (createNoAuthResult.success) passedTests += 1;

    // Test Get All SEO - Success
    console.log('\n📝 Running Get All SEO Tests...');
    const getAllResult = await testGetAllSeos();
    results.push({ suite: 'Get All SEO - Success', ...getAllResult });
    totalTests += 1;
    if (getAllResult.success) passedTests += 1;

    // Test Get All SEO - No Auth
    const getAllNoAuthResult = await testGetAllSeosNoAuth();
    results.push({ suite: 'Get All SEO - No Auth', ...getAllNoAuthResult });
    totalTests += 1;
    if (getAllNoAuthResult.success) passedTests += 1;

    // Test Get SEO by ID - Success
    console.log('\n📝 Running Get SEO by ID Tests...');
    const getByIdResult = await testGetSeoById();
    results.push({ suite: 'Get SEO by ID - Success', ...getByIdResult });
    totalTests += 1;
    if (getByIdResult.success) passedTests += 1;

    // Test Get SEO by ID - Not Found
    const getByIdNotFoundResult = await testGetSeoByIdNotFound();
    results.push({ suite: 'Get SEO by ID - Not Found', ...getByIdNotFoundResult });
    totalTests += 1;
    if (getByIdNotFoundResult.success) passedTests += 1;

    // Test Get SEO by ID - No Auth
    const getByIdNoAuthResult = await testGetSeoByIdNoAuth();
    results.push({ suite: 'Get SEO by ID - No Auth', ...getByIdNoAuthResult });
    totalTests += 1;
    if (getByIdNoAuthResult.success) passedTests += 1;

    // Test Update SEO - Success
    console.log('\n📝 Running Update SEO Tests...');
    const updateResult = await testUpdateSeo();
    results.push({ suite: 'Update SEO - Success', ...updateResult });
    totalTests += 1;
    if (updateResult.success) passedTests += 1;

    // Test Update SEO - Not Found
    const updateNotFoundResult = await testUpdateSeoNotFound();
    results.push({ suite: 'Update SEO - Not Found', ...updateNotFoundResult });
    totalTests += 1;
    if (updateNotFoundResult.success) passedTests += 1;

    // Test Update SEO - No Auth
    const updateNoAuthResult = await testUpdateSeoNoAuth();
    results.push({ suite: 'Update SEO - No Auth', ...updateNoAuthResult });
    totalTests += 1;
    if (updateNoAuthResult.success) passedTests += 1;

    // Test Update SEO - Invalid Data
    const updateInvalidResult = await testUpdateSeoInvalidData();
    results.push({ suite: 'Update SEO - Invalid Data', ...updateInvalidResult });
    totalTests += 1;
    if (updateInvalidResult.success) passedTests += 1;

    // Test Delete SEO - Success
    console.log('\n📝 Running Delete SEO Tests...');
    const deleteResult = await testDeleteSeo();
    results.push({ suite: 'Delete SEO - Success', ...deleteResult });
    totalTests += 1;
    if (deleteResult.success) passedTests += 1;

    // Test Delete SEO - Not Found
    const deleteNotFoundResult = await testDeleteSeoNotFound();
    results.push({ suite: 'Delete SEO - Not Found', ...deleteNotFoundResult });
    totalTests += 1;
    if (deleteNotFoundResult.success) passedTests += 1;

    // Test Delete SEO - No Auth
    const deleteNoAuthResult = await testDeleteSeoNoAuth();
    results.push({ suite: 'Delete SEO - No Auth', ...deleteNoAuthResult });
    totalTests += 1;
    if (deleteNoAuthResult.success) passedTests += 1;

    // Test Soft Delete Verification
    const softDeleteResult = await testSoftDeleteVerification();
    results.push({ suite: 'Soft Delete Verification', ...softDeleteResult });
    totalTests += 1;
    if (softDeleteResult.success) passedTests += 1;

  } catch (error) {
    console.error(`💥 ERROR during test execution: ${error.message}`);
    results.push({ suite: 'Test Execution Error', success: false, error: error.message });
  }

  // Summary
  console.log('\n📊 Complete SEO API Test Suite Results:');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.suite}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n📈 Final Results: ${passedTests}/${totalTests} test suites passed`);

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`📊 Success Rate: ${successRate}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL SEO API TESTS PASSED! 🎉');
    console.log('✅ SEO feature is fully functional and tested');
    process.exit(0);
  } else {
    console.log('\n💥 SOME SEO API TESTS FAILED');
    console.log('❌ Please review the failed tests above');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllSeoTests();
}

module.exports = { runTests };