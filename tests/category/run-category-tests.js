#!/usr/bin/env node

/**
 * Category API Test Runner
 * Runs all category-related tests sequentially
 */

const { spawn } = require('child_process');
const path = require('path');

// Test files in order
const tests = [
  'test-create-category.js',
  'test-get-all-categories.js',
  'test-get-category-by-id.js',
  'test-get-by-type.js',
  'test-update-category.js',
  'test-delete-category.js'
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

    child.on('error', (err) => {
      console.error(`Failed to start test: ${err.message}`);
      results.failed.push(testFile);
      resolve(1);
    });
  });
}

/**
 * Run all tests sequentially
 */
async function runAllTests() {
  console.log('🚀 Starting Category API Tests...\n');
  console.log(`Available tests: ${tests.join(', ')}\n`);

  for (const test of tests) {
    await runTest(test);
  }

  // Print summary
  console.log('='.repeat(60));
  console.log('🏆 CATEGORY API TESTS SUMMARY');
  console.log('='.repeat(60));

  results.passed.forEach(test => {
    console.log(`✅ ${test}`);
  });

  results.failed.forEach(test => {
    console.log(`❌ ${test}`);
  });

  console.log('\n📊 OVERALL RESULTS:');
  console.log(`✅ Total Passed: ${results.passed.length}`);
  console.log(`❌ Total Failed: ${results.failed.length}`);
  console.log(`📈 Success Rate: ${((results.passed.length / tests.length) * 100).toFixed(1)}%`);

  if (results.failed.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Category APIs are working correctly.');
  } else {
    console.log(`\n⚠️  ${results.failed.length} test(s) failed. Please review the results above.`);
  }

  console.log('='.repeat(60));
  console.log('');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
