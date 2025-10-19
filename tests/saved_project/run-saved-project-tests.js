#!/usr/bin/env node

/**
 * Saved Project API Test Runner
 * Runs all saved project-related tests
 *
 * Usage:
 *   node tests/saved_project/run-saved-project-tests.js           # Run all tests
 *   node tests/saved_project/run-saved-project-tests.js save      # Run only save project test
 *   node tests/saved_project/run-saved-project-tests.js get-all   # Run only get all saved test
 *   node tests/saved_project/run-saved-project-tests.js unsave    # Run only unsave project test
 *   node tests/saved_project/run-saved-project-tests.js get-my    # Run only get my saved projects test
 */

const { printSection, printSummary, getTestCounters, resetTestCounters } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

const SCRIPTS = {
  'save': 'test-save-project.js',
  'get-all': 'test-get-all-saved.js',
  'unsave': 'test-unsave-project.js',
  'get-my': 'test-get-my-saved-projects.js'
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
  console.log('🧪 Starting Saved Project API Tests...\n');
  console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
  console.log('');

  try {
    // Import test modules
    const saveTests = require('./test-save-project');
    const getAllTests = require('./test-get-all-saved');
    const unsaveTests = require('./test-unsave-project');
    const getMyTests = require('./test-get-my-saved-projects');

    // Run all test suites
    await runTestModule('Save Project Tests', saveTests);
    await runTestModule('Get All Saved Tests', getAllTests);
    await runTestModule('Unsave Project Tests', unsaveTests);
    await runTestModule('Get My Saved Projects Tests', getMyTests);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏆 SAVED PROJECT API TESTS SUMMARY');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Saved Project APIs are working correctly.');
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