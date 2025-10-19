#!/usr/bin/env node

/**
 * Complete Client Routes API Test Suite Runner
 *
 * This script runs all client routes-related tests:
 * - Client Profile Management
 * - Client Statistics
 * - Client Data Retrieval
 *
 * Usage: node tests/clients/run-clients-tests.js
 */

const { printSection, printSummary, getTestCounters, resetTestCounters } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

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

    return counters;

  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
    return { passed: 0, failed: 1 };
  }
}

/**
 * Main test runner
 */
async function runAllClientTests() {
  console.log('👤 Starting Complete Client Routes API Test Suite...\n');
  console.log('=' .repeat(60));

  try {
    // Import test modules
    const clientRoutesTests = require('./test-client-routes');

    // Run all test suites
    await runTestModule('Client Routes Tests', clientRoutesTests);

    // Get final counters
    const finalCounters = getTestCounters();
    totalPassed = finalCounters.passed;
    totalFailed = finalCounters.failed;

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏁 CLIENT ROUTES TEST SUITE COMPLETE');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    // Exit with appropriate code
    if (totalFailed === 0) {
      console.log('\n✅ All client routes tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some client routes tests failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllClientTests();
}

module.exports = {
  runAllClientTests
};