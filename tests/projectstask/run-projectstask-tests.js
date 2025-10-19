#!/usr/bin/env node

/**
 * Project Task Tests Runner
 * Runs all project task API tests
 *
 * Usage:
 *   node tests/projectstask/run-projectstask-tests.js           # Run all tests
 *   node tests/projectstask/run-projectstask-tests.js insert    # Run only insert test
 *   node tests/projectstask/run-projectstask-tests.js get-by-id # Run only get by id test
 *   node tests/projectstask/run-projectstask-tests.js update    # Run only update test
 *   node tests/projectstask/run-projectstask-tests.js delete    # Run only delete test
 *   node tests/projectstask/run-projectstask-tests.js get-all   # Run only get all test
 *   node tests/projectstask/run-projectstask-tests.js update-status # Run only update status test
 *   node tests/projectstask/run-projectstask-tests.js count-active # Run only count active test
 *   node tests/projectstask/run-projectstask-tests.js public-listing # Run only public listing test
 *   node tests/projectstask/run-projectstask-tests.js get-by-client-id # Run only get by client id test
 *   node tests/projectstask/run-projectstask-tests.js submit    # Run only submit project test
 *   node tests/projectstask/run-projectstask-tests.js approve   # Run only approve submission test
 *   node tests/projectstask/run-projectstask-tests.js active-clients # Run only active clients analytics test
 *   node tests/projectstask/run-projectstask-tests.js active-editors # Run only active editors analytics test
 */

const { printSection, printSummary, getTestCounters, resetTestCounters } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

const SCRIPTS = {
  'insert': 'test-insert-project-task.js',
  'get-by-id': 'test-get-project-task-by-id.js',
  'update': 'test-update-project-task.js',
  'delete': 'test-delete-project-task.js',
  'get-all': 'test-get-all-project-tasks.js',
  'update-status': 'test-update-project-task-status.js',
  'count-active': 'test-count-active-project-tasks.js',
  'public-listing': 'test-get-public-project-listings.js',
  'get-by-client-id': 'test-get-projects-by-client-id.js',
  'submit': 'test-submit-project.js',
  'approve': 'test-approve-submission.js',
  'active-clients': 'test-active-clients-analytics.js',
  'active-editors': 'test-active-editors-analytics.js'
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
  console.log('🚀 Starting Project Task API Tests...\n');
  console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
  console.log('');

  try {
    // Import test modules
    const insertTests = require('./test-insert-project-task');
    const getByIdTests = require('./test-get-project-task-by-id');
    const updateTests = require('./test-update-project-task');
    const deleteTests = require('./test-delete-project-task');
    const getAllTests = require('./test-get-all-project-tasks');
    const updateStatusTests = require('./test-update-project-task-status');
    const countActiveTests = require('./test-count-active-project-tasks');
    const publicListingTests = require('./test-get-public-project-listings');
    const getByClientIdTests = require('./test-get-projects-by-client-id');
    const submitTests = require('./test-submit-project');
    const approveTests = require('./test-approve-submission');
    const activeClientsTests = require('./test-active-clients-analytics');
    const activeEditorsTests = require('./test-active-editors-analytics');

    // Run all test suites
    await runTestModule('Insert Project Task Tests', insertTests);
    await runTestModule('Get Project Task by ID Tests', getByIdTests);
    await runTestModule('Update Project Task Tests', updateTests);
    await runTestModule('Delete Project Task Tests', deleteTests);
    await runTestModule('Get All Project Tasks Tests', getAllTests);
    await runTestModule('Update Project Task Status Tests', updateStatusTests);
    await runTestModule('Count Active Project Tasks Tests', countActiveTests);
    await runTestModule('Get Public Project Listings Tests', publicListingTests);
    await runTestModule('Get Projects by Client ID Tests', getByClientIdTests);
    await runTestModule('Submit Project Tests', submitTests);
    await runTestModule('Approve Submission Tests', approveTests);
    await runTestModule('Active Clients Analytics Tests', activeClientsTests);
    await runTestModule('Active Editors Analytics Tests', activeEditorsTests);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏆 PROJECT TASK API TESTS SUMMARY');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Project Task APIs are working correctly.');
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