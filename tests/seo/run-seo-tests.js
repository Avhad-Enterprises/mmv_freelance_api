#!/usr/bin/env node

/**
 * SEO API Test Runner
 * Runs all SEO-related tests
 *
 * Usage:
 *   node tests/seo/run-seo-tests.js           # Run all tests
 *   node tests/seo/run-seo-tests.js create    # Run only create seo test
 *   node tests/seo/run-seo-tests.js get-all   # Run only get all seos test
 *   node tests/seo/run-seo-tests.js get-id    # Run only get seo by id test
 *   node tests/seo/run-seo-tests.js update    # Run only update seo test
 *   node tests/seo/run-seo-tests.js delete    # Run only delete seo test
 *   node tests/seo/run-seo-tests.js all       # Run only test all seos test
 */

const { printSection, printSummary, getTestCounters, resetTestCounters } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

const SCRIPTS = {
  'create': 'test-create-seo.js',
  'get-all': 'test-get-all-seos.js',
  'get-id': 'test-get-seo-by-id.js',
  'update': 'test-update-seo.js',
  'delete': 'test-delete-seo.js',
  'all': 'test-all-seos.js'
};

/**
 * Run a test module and collect results
 */
async function runTestModule(name, testModule) {
  console.log(`\n🏃 Running ${name}...\n`);

  try {
    // Reset counters for this module
    resetTestCounters();

    // Override process.exit to prevent individual tests from terminating the suite
    const originalProcessExit = process.exit;
    process.exit = function(code) {
      // Don't actually exit, just return the code
      return code;
    };

    // Run the test
    await testModule.runTests();

    // Restore process.exit
    process.exit = originalProcessExit;

    // Get the counters after running the test
    const counters = getTestCounters();

    console.log(`\n✅ ${name} completed: ${counters.passed} passed, ${counters.failed} failed\n`);

    // Accumulate totals
    totalPassed += counters.passed;
    totalFailed += counters.failed;

    return counters;

  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
    totalFailed += 1; // Count as 1 failure
    return { passed: 0, failed: 1 };
  }
}

async function runAllTests() {
  console.log('🧪 Starting SEO API Tests...\n');
  console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
  console.log('');

  try {
    // Import test modules
    const createTests = require('./test-create-seo');
    const getAllTests = require('./test-get-all-seos');
    const getByIdTests = require('./test-get-seo-by-id');
    const updateTests = require('./test-update-seo');
    const deleteTests = require('./test-delete-seo');
    const allTests = require('./test-all-seos');

    // Run all test suites
    await runTestModule('Create SEO Tests', createTests);
    await runTestModule('Get All SEO Tests', getAllTests);
    await runTestModule('Get SEO by ID Tests', getByIdTests);
    await runTestModule('Update SEO Tests', updateTests);
    await runTestModule('Delete SEO Tests', deleteTests);
    await runTestModule('All SEO Tests', allTests);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏆 SEO API TESTS SUMMARY');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! SEO APIs are working correctly.');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed. Please review the results above.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

async function runSpecificTest(testName) {
  if (!SCRIPTS[testName]) {
    console.error(`❌ Unknown test: ${testName}`);
    console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
    process.exit(1);
  }

  try {
    const testModule = require(`./${SCRIPTS[testName].replace('.js', '')}`);
    const result = await runTestModule(`${testName} Test`, testModule);
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  runAllTests();
} else {
  runSpecificTest(args[0]);
}