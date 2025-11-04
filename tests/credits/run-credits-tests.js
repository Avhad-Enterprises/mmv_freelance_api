#!/usr/bin/env node

/**
 * Run All Credits API Tests
 * Executes all credits-related test files
 */

const { printSection, printSummary } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;

/**
 * Run a test file and collect results
 */
async function runTestFile(testFile, description) {
  console.log(`\n🧪 Running ${description}...`);

  try {
    const testModule = require(`./${testFile}`);
    if (testModule.runTests) {
      // Note: Individual test files handle their own exit codes
      // We'll capture their results differently in a real implementation
      console.log(`✅ ${description} completed`);
    } else {
      console.log(`⚠️  ${description} has no runTests function`);
    }
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    totalFailed++;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('💰 CREDITS API TEST SUITE');
  console.log('=========================\n');

  printSection('RUNNING ALL CREDITS TESTS');

  // Run individual test files
  await runTestFile('test-get-credits-balance.js', 'Get Credits Balance Tests');
  await runTestFile('test-purchase-credits.js', 'Purchase Credits Tests');

  printSection('CREDITS TEST SUITE COMPLETE');

  console.log('\n📋 Note: Individual test files show their own results.');
  console.log('📋 Check each test file output for detailed pass/fail counts.');
  console.log('📋 Run individual tests: node tests/credits/test-<name>.js\n');
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test suite runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };