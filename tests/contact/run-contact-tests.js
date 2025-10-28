#!/usr/bin/env node

/**
 * Contact API Tests Runner
 *
 * This script runs all contact-related test suites
 *
 * Usage:
 *   node tests/contact/run-contact-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');

const CONTACT_TESTS = [
  'test-contact-submit.js',
  'test-contact-admin.js'
];

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, testFile);

    console.log(`\n▶️  Running tests/contact/${testFile}...`);

    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ tests/contact/${testFile} PASSED`);
        resolve({ test: testFile, success: true, code });
      } else {
        console.log(`❌ tests/contact/${testFile} FAILED`);
        resolve({ test: testFile, success: false, code });
      }
    });

    child.on('error', (error) => {
      console.error(`💥 Error running ${testFile}:`, error);
      reject({ test: testFile, error });
    });
  });
}

async function runAllContactTests() {
  console.log('🧪 RUNNING ALL CONTACT API TESTS');
  console.log('====================================');

  const results = [];

  try {
    for (const testFile of CONTACT_TESTS) {
      const result = await runTest(testFile);
      results.push(result);
    }

    // Print final summary
    console.log('\n====================================');
    console.log('FINAL TEST SUMMARY');
    console.log('====================================');
    console.log(`Total Tests: ${results.length}`);
    console.log(`Completed:   ${results.length}`);
    console.log(`Passed:      ${results.filter(r => r.success).length}`);
    console.log(`Failed:      ${results.filter(r => !r.success).length}`);

    const failedTests = results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All contact tests passed!');
    }

  } catch (error) {
    console.error('\n💥 Contact test runner error:', error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllContactTests();
}