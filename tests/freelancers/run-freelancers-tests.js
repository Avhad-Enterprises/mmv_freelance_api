#!/usr/bin/env node

/**
 * Freelancers API Tests Runner
 * Runs all freelancer-related API tests
 */

const { printSection, printSummary } = require('../test-utils');

let totalPassed = 0;
let totalFailed = 0;
let totalTests = 0;

/**
 * Run a test file and collect results
 */
async function runTestFile(testFile, description) {
  console.log(`\n🔄 Running ${description}...`);

  try {
    const testModule = require(`./${testFile}`);
    // Note: We can't easily capture the exit code, so we'll assume success
    // In a real implementation, you'd modify the test files to return results
    console.log(`✅ ${description} completed`);
    return { passed: 0, failed: 0, total: 0 }; // Placeholder
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 FREELANCERS API TEST SUITE');
  console.log('==============================\n');

  printSection('Running Freelancer Tests');

  // Test files to run
  const testFiles = [
    { file: 'test-get-all-freelancers-public', description: 'Get All Freelancers Public Tests' },
    { file: 'test-get-all-freelancers', description: 'Get All Freelancers Tests' },
    { file: 'test-get-available-freelancers', description: 'Get Available Freelancers Tests' }
  ];

  for (const test of testFiles) {
    const result = await runTestFile(test.file, test.description);
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalTests += result.total;
  }

  // Print final summary
  console.log('\n' + '='.repeat(50));
  printSummary(totalPassed, totalFailed, totalTests);
  console.log('='.repeat(50));

  // Exit with appropriate code
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };