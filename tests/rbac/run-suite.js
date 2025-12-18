#!/usr/bin/env node

/**
 * RBAC (Role-Based Access Control) Tests Runner
 * Runs all RBAC-related tests
 *
 * Usage:
 *   node tests/rbac/run-suite.js           # Run all tests
 *   node tests/rbac/run-suite.js 01        # Run only 01-integration.test.js
 *   node tests/rbac/run-suite.js 02        # Run only 02-middleware-check.test.js
 *   node tests/rbac/run-suite.js 03        # Run only 03-admin-matrix.test.js
 */

const { printSection, printSummary, getTestCounters, resetTestCounters } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

const SCRIPTS = {
  '01': '01-integration.test.js',
  '02': '02-middleware-check.test.js',
  '03': '03-admin-matrix.test.js'
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
    process.exit = function (code) {
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
  console.log('Available tests:', Object.values(SCRIPTS).join(', '));
  console.log('');

  try {
    // Import test modules
    const integrationTests = require('./01-integration.test');
    const middlewareTests = require('./02-middleware-check.test');
    const matrixTests = require('./03-admin-matrix.test');

    // Run all test suites
    await runTestModule('01 Integration Tests', integrationTests);
    await runTestModule('02 Middleware Check', middlewareTests);
    await runTestModule('03 Admin Matrix Tests', matrixTests);

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

async function runSpecificTest(testKey) {
  if (!SCRIPTS[testKey]) {
    console.error(`❌ Unknown test key: ${testKey}`);
    console.log('Use: 01, 02, or 03');
    process.exit(1);
  }

  try {
    const testModule = require(`./${SCRIPTS[testKey].replace('.js', '')}`);
    const result = await runTestModule(`${SCRIPTS[testKey]}`, testModule);
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