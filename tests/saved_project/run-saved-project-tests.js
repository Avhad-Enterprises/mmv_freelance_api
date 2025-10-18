#!/usr/bin/env node

/**
 * Saved Project API Test Runner
 * Runs all saved project-related tests sequentially
 */

const { spawn } = require('child_process');
const path = require('path');

// Test files in order
const tests = [
  'test-save-project.js',
  'test-get-all-saved.js',
  'test-unsave-project.js',
  'test-get-my-saved-projects.js'
];

const results = {
  passed: [],
  failed: []
};

/**
 * Run a single test file
 */
function runTest(testFile) {
  return new Promise((resolve) => {
    const testPath = path.join(__dirname, testFile);
    console.log(`\n🚀 Running ${testFile}...`);
    console.log(`Script: ${testPath}`);
    console.log('='.repeat(50));

    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      cwd: __dirname
    });

    child.on('close', (code) => {
      if (code === 0) {
        results.passed.push(testFile);
        console.log(`\n✅ ${testFile} completed successfully\n`);
      } else {
        results.failed.push(testFile);
        console.log(`\n❌ ${testFile} failed with exit code ${code}\n`);
      }
      resolve(code);
    });

    child.on('error', (error) => {
      console.log(`\n❌ ${testFile} failed with error: ${error.message}\n`);
      results.failed.push(testFile);
      resolve(1);
    });
  });
}

/**
 * Run all tests sequentially
 */
async function runAllTests() {
  console.log('🧪 SAVED PROJECT API TEST SUITE');
  console.log('=====================================\n');
  console.log(`Running ${tests.length} test files...\n`);

  for (const test of tests) {
    await runTest(test);
  }

  // Print final summary
  console.log('\n🏆 SAVED PROJECT API TESTS SUMMARY');
  console.log('=====================================');
  console.log(`✅ Total Passed: ${results.passed.length}`);
  console.log(`❌ Total Failed: ${results.failed.length}`);
  console.log(`📊 Success Rate: ${((results.passed.length / tests.length) * 100).toFixed(1)}%\n`);

  if (results.passed.length > 0) {
    console.log('✅ PASSED TESTS:');
    results.passed.forEach(test => console.log(`   • ${test}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.failed.forEach(test => console.log(`   • ${test}`));
  }

  const overallSuccess = results.failed.length === 0;
  console.log(`\n${overallSuccess ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED!'}`);
  console.log(`${overallSuccess ? 'Saved Project APIs are working correctly.' : 'Please check the failed tests above.'}`);

  // Exit with appropriate code
  process.exit(overallSuccess ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };