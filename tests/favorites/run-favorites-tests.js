#!/usr/bin/env node

/**
 * Complete Favorites API Test Suite Runner
 *
 * This script runs all favorites-related tests:
 * - Add Favorite
 * - Get My Favorites
 * - Remove Favorite
 * - Get My Favorites Details
 *
 * Usage: node tests/favorites/run-favorites-tests.js
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
async function runAllFavoritesTests() {
  console.log('⭐ Starting Complete Favorites API Test Suite...\n');
  console.log('=' .repeat(60));

  try {
    // Import test modules
    const addFavoriteTests = require('./test-add-favorite');
    const getMyFavoritesTests = require('./test-get-my-favorites');
    const removeFavoriteTests = require('./test-remove-favorite');
    const getMyFavoritesDetailsTests = require('./test-get-my-favorites-details');

    // Run all test suites
    await runTestModule('Add Favorite Tests', addFavoriteTests);
    await runTestModule('Get My Favorites Tests', getMyFavoritesTests);
    await runTestModule('Remove Favorite Tests', removeFavoriteTests);
    await runTestModule('Get My Favorites Details Tests', getMyFavoritesDetailsTests);

    // Get final counters
    const finalCounters = getTestCounters();
    totalPassed = finalCounters.passed;
    totalFailed = finalCounters.failed;

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FAVORITES TEST SUITE COMPLETE');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    // Exit with appropriate code
    if (totalFailed === 0) {
      console.log('\n✅ All favorites tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some favorites tests failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllFavoritesTests();
}

module.exports = {
  runAllFavoritesTests
};
