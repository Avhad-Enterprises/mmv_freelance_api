#!/usr/bin/env node

/**
 * RBAC (Role-Based Access Control) Tests Runner
 * Runs all RBAC-related tests
 *
 * Usage:
 *   node tests/rbac/run-rbac-tests.js           # Run all tests
 *   node tests/rbac/run-rbac-tests.js complete  # Run only complete RBAC test
 *   node tests/rbac/run-rbac-tests.js role-based # Run only role-based access test
 */

const { printSection, printSummary, getTestCounters, resetTestCounters } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

const SCRIPTS = {
  'complete': 'test-rbac-complete.js',
  'role-based': 'test-role-based-access.js'
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
    await testModule.runAllTests();

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
  console.log('🚀 Starting RBAC (Role-Based Access Control) API Tests...\n');
  console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
  console.log('');

  try {
    // Import test modules
    const completeTests = require('./test-rbac-complete');
    const roleBasedTests = require('./test-role-based-access');

    // Run all test suites
    await runTestModule('Complete RBAC Tests', completeTests);
    await runTestModule('Role-Based Access Tests', roleBasedTests);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏆 RBAC API TESTS SUMMARY');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! RBAC system is working correctly.');
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