#!/usr/bin/env node

/**
 * Complete Category API Test Suite Runner
 *
 * This script runs all category-related tests:
 * - Create Category
 * - Get All Categories
 * - Get Category by ID
 * - Get Categories by Type
 * - Update Category
 * - Delete Category
 *
 * Usage: node tests/category/run-category-tests.js
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
async function runAllCategoryTests() {
  console.log('� Starting Complete Category API Test Suite...\n');
  console.log('=' .repeat(60));

  try {
    // Import test modules
    const createCategoryTests = require('./test-create-category');
    const getAllCategoriesTests = require('./test-get-all-categories');
    const getCategoryByIdTests = require('./test-get-category-by-id');
    const getByTypeTests = require('./test-get-by-type');
    const updateCategoryTests = require('./test-update-category');
    const deleteCategoryTests = require('./test-delete-category');

    // Run all test suites
    await runTestModule('Create Category Tests', createCategoryTests);
    await runTestModule('Get All Categories Tests', getAllCategoriesTests);
    await runTestModule('Get Category by ID Tests', getCategoryByIdTests);
    await runTestModule('Get Categories by Type Tests', getByTypeTests);
    await runTestModule('Update Category Tests', updateCategoryTests);
    await runTestModule('Delete Category Tests', deleteCategoryTests);

    // Get final counters
    const finalCounters = getTestCounters();
    totalPassed = finalCounters.passed;
    totalFailed = finalCounters.failed;

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏁 CATEGORY TEST SUITE COMPLETE');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    // Exit with appropriate code
    if (totalFailed === 0) {
      console.log('\n✅ All category tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some category tests failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllCategoryTests();
}

module.exports = {
  runAllCategoryTests
};
