#!/usr/bin/env node

/**
 * Project Task Tests Runner
 * Runs all project task API tests
 *
 * Usage:
 *   node tests/projectstask/run-projectstask-tests.js           # Run all tests
 *   node tests/projectstask/run-projectstask-tests.js insert    # Run only insert test
 *   node tests/projectstask/run-projectstask-tests.js get-by-id # Run only get by id test
 *   node tests/projectstask/run-projectstask-tests.js update    # Run only update test
 *   node tests/projectstask/run-projectstask-tests.js delete    # Run only delete test
 *   node tests/projectstask/run-projectstask-tests.js get-all   # Run only get all test
 *   node tests/projectstask/run-projectstask-tests.js update-status # Run only update status test
 *   node tests/projectstask/run-projectstask-tests.js count-active # Run only count active test
 *   node tests/projectstask/run-projectstask-tests.js public-listing # Run only public listing test
 *   node tests/projectstask/run-projectstask-tests.js get-by-client-id # Run only get by client id test
 *   node tests/projectstask/run-projectstask-tests.js submit    # Run only submit project test
 *   node tests/projectstask/run-projectstask-tests.js approve   # Run only approve submission test
 *   node tests/projectstask/run-projectstask-tests.js active-clients # Run only active clients analytics test
 *   node tests/projectstask/run-projectstask-tests.js active-editors # Run only active editors analytics test
 */

const { spawn } = require('child_process');
const path = require('path');

const SCRIPTS = {
  'insert': 'test-insert-project-task.js',
  'get-by-id': 'test-get-project-task-by-id.js',
  'update': 'test-update-project-task.js',
  'delete': 'test-delete-project-task.js',
  'get-all': 'test-get-all-project-tasks.js',
  'update-status': 'test-update-project-task-status.js',
  'count-active': 'test-count-active-project-tasks.js',
  'public-listing': 'test-get-public-project-listings.js',
  'get-by-client-id': 'test-get-projects-by-client-id.js',
  'submit': 'test-submit-project.js',
  'approve': 'test-approve-submission.js',
  'active-clients': 'test-active-clients-analytics.js',
  'active-editors': 'test-active-editors-analytics.js'
};

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, SCRIPTS[scriptName]);

    console.log(`\n🚀 Running ${scriptName} test...`);
    console.log(`Script: ${scriptPath}`);
    console.log('='.repeat(50));

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} test completed successfully`);
        resolve({ script: scriptName, success: true, code });
      } else {
        console.log(`\n❌ ${scriptName} test failed with exit code ${code}`);
        resolve({ script: scriptName, success: false, code });
      }
    });

    child.on('error', (error) => {
      console.error(`\n💥 Error running ${scriptName} test:`, error);
      reject({ script: scriptName, error });
    });
  });
}

async function runAllTests() {
  console.log('🚀 Starting Project Task API Tests...\n');
  console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
  console.log('');

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const testName of Object.keys(SCRIPTS)) {
    try {
      const result = await runScript(testName);
      results.push(result);
      if (result.success) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    } catch (error) {
      console.error(`Failed to run ${testName}:`, error);
      results.push({ script: testName, success: false, error: error.message });
      totalFailed++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('🏆 PROJECT TASK API TESTS SUMMARY');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.script}`);
  });

  console.log('\n📊 OVERALL RESULTS:');
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

  if (totalFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Project Task APIs are working correctly.');
  } else {
    console.log(`\n⚠️  ${totalFailed} test(s) failed. Please review the results above.`);
  }

  console.log('='.repeat(60));

  process.exit(totalFailed > 0 ? 1 : 0);
}

async function runSpecificTest(testName) {
  if (!SCRIPTS[testName]) {
    console.error(`❌ Unknown test: ${testName}`);
    console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
    process.exit(1);
  }

  try {
    const result = await runScript(testName);
    process.exit(result.success ? 0 : 1);
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