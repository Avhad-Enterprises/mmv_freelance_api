const { testGetPublicRobots } = require('./test-get-public-robots');
const { testViewRobots, testViewRobotsNoAuth } = require('./test-view-robots');
const {
  testUpdateRobots,
  testUpdateRobotsNoAuth,
  testUpdateRobotsInvalidData,
  testUpdateAndVerifyPublic
} = require('./test-update-robots');

const { COLORS } = require('../test-utils');

/**
 * Complete Robots.txt API Test Suite
 */
async function runAllRobotsTests() {
  console.log('🚀 Starting Complete Robots.txt API Test Suite');
  console.log('==========================================');

  const testResults = [];

  try {
    // Test Public Robots.txt
    console.log('\n📝 Running Public Robots.txt Tests...');
    const publicResult = await testGetPublicRobots();
    testResults.push({ name: 'Get Public Robots.txt', ...publicResult });

    // Test View Robots
    console.log('\n📝 Running View Robots Tests...');
    const viewResult = await testViewRobots();
    testResults.push({ name: 'View Robots (Auth)', ...viewResult });

    const viewNoAuthResult = await testViewRobotsNoAuth();
    testResults.push({ name: 'View Robots (No Auth)', ...viewNoAuthResult });

    // Test Update Robots
    console.log('\n📝 Running Update Robots Tests...');
    const updateResult = await testUpdateRobots();
    testResults.push({ name: 'Update Robots', ...updateResult });

    const updateNoAuthResult = await testUpdateRobotsNoAuth();
    testResults.push({ name: 'Update Robots (No Auth)', ...updateNoAuthResult });

    const updateInvalidResult = await testUpdateRobotsInvalidData();
    testResults.push({ name: 'Update Robots (Invalid Data)', ...updateInvalidResult });

    const updateVerifyResult = await testUpdateAndVerifyPublic();
    testResults.push({ name: 'Update and Verify Public', ...updateVerifyResult });

  } catch (error) {
    console.error(`${COLORS.red}💥 CRITICAL ERROR in test suite: ${error.message}${COLORS.reset}`);
    return;
  }

  // Display results
  console.log('\n📊 Complete Robots.txt API Test Suite Results:');
  console.log('='.repeat(60));

  let passedCount = 0;
  testResults.forEach((result, index) => {
    const status = result.success ?
      `${COLORS.green}✅ PASS${COLORS.reset}` :
      `${COLORS.red}❌ FAIL${COLORS.reset}`;
    console.log(`${index + 1}. ${result.name}: ${status}`);
    if (result.success) passedCount++;
  });

  const successRate = ((passedCount / testResults.length) * 100).toFixed(1);
  console.log(`\n📈 Final Results: ${passedCount}/${testResults.length} test suites passed`);
  console.log(`📊 Success Rate: ${successRate}%`);

  if (passedCount === testResults.length) {
    console.log(`\n${COLORS.green}🎉 ALL ROBOTS.TXT API TESTS PASSED! 🎉${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.red}💥 SOME ROBOTS.TXT API TESTS FAILED${COLORS.reset}`);
    console.log(`${COLORS.yellow}❌ Please review the failed tests above${COLORS.reset}`);
  }

  return {
    totalTests: testResults.length,
    passedTests: passedCount,
    successRate: parseFloat(successRate),
    allPassed: passedCount === testResults.length
  };
}

// Run the test suite
if (require.main === module) {
  runAllRobotsTests().then((result) => {
    process.exit(result && result.allPassed ? 0 : 1);
  }).catch((error) => {
    console.error(`${COLORS.red}💥 Test suite failed: ${error.message}${COLORS.reset}`);
    process.exit(1);
  });
}

module.exports = { runAllRobotsTests };