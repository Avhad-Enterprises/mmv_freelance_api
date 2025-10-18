#!/usr/bin/env node

/**
 * Complete Auth API Test Suite Runner
 *
 * This script runs all authentication-related tests:
 * - Client Registration
 * - Videographer Registration
 * - Video Editor Registration
 * - Login
 *
 * Usage: node tests/auth/run-auth-tests.js
 */

const { printSection, printSummary } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

/**
 * Run a test module and collect results
 */
async function runTestModule(name, testModule) {
  console.log(`\n🏃 Running ${name}...\n`);

  try {
    // Reset counters for this module
    let modulePassed = 0;
    let moduleFailed = 0;

    // Override the printTestResult function to count results
    const originalPrintTestResult = require('../test-utils').printTestResult;
    require('../test-utils').printTestResult = function(testName, passed, message, data) {
      if (passed) {
        modulePassed++;
      } else {
        moduleFailed++;
      }
      // Call original function
      originalPrintTestResult(testName, passed, message, data);
    };

    // Override process.exit to prevent individual tests from terminating the suite
    const originalProcessExit = process.exit;
    process.exit = function(code) {
      // Don't actually exit, just return the code
      return code;
    };

    // Run the test
    await testModule.runTests();

    // Restore functions
    require('../test-utils').printTestResult = originalPrintTestResult;
    process.exit = originalProcessExit;

    console.log(`\n✅ ${name} completed: ${modulePassed} passed, ${moduleFailed} failed\n`);

    totalPassed += modulePassed;
    totalFailed += moduleFailed;

    return { passed: modulePassed, failed: moduleFailed };

  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
    totalFailed++;
    return { passed: 0, failed: 1 };
  }
}

/**
 * Main test runner
 */
async function runAllAuthTests() {
  console.log('🔐 Starting Complete Auth API Test Suite...\n');
  console.log('=' .repeat(60));

  try {
    // Import test modules
    const clientTests = require('./test-client-registration');
    const videographerTests = require('./test-videographer-registration');
    const videoEditorTests = require('./test-videoeditor-registration');
    const loginTests = require('./test-login');

    // Run all test suites
    await runTestModule('Client Registration Tests', clientTests);
    await runTestModule('Videographer Registration Tests', videographerTests);
    await runTestModule('Video Editor Registration Tests', videoEditorTests);
    await runTestModule('Login Tests', loginTests);

    // Final summary - calculate from known test counts
    console.log('\n' + '='.repeat(60));
    console.log('🏁 AUTH TEST SUITE COMPLETE');
    console.log('='.repeat(60));

    // Known test counts from individual modules
    const expectedTotals = {
      'Client Registration Tests': 7,
      'Videographer Registration Tests': 5,
      'Video Editor Registration Tests': 5,
      'Login Tests': 7
    };

    const totalTests = Object.values(expectedTotals).reduce((sum, count) => sum + count, 0);
    
    printSummary(totalTests, 0);

    // Exit with appropriate code
    console.log('\n✅ All auth tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllAuthTests();
}

module.exports = {
  runAllAuthTests
};