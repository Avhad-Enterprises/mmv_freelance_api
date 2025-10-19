#!/usr/bin/env node

/**
 * Skills API Test Runner
 * Runs all skills-related tests
 *
 * Usage:
 *   node tests/skill/run-skills-tests.js           # Run all tests
 *   node tests/skill/run-skills-tests.js create    # Run only create skill test
 *   node tests/skill/run-skills-tests.js get-all   # Run only get all skills test
 *   node tests/skill/run-skills-tests.js get-id    # Run only get skill by id test
 *   node tests/skill/run-skills-tests.js update    # Run only update skill test
 *   node tests/skill/run-skills-tests.js delete    # Run only delete skill test
 *   node tests/skill/run-skills-tests.js all       # Run only test all skills test
 */

const { printSection, printSummary, getTestCounters, resetTestCounters } = require('./test-utils');

let totalPassed = 0;
let totalFailed = 0;

const SCRIPTS = {
  'create': 'test-create-skill.js',
  'get-all': 'test-get-all-skills.js',
  'get-id': 'test-get-skill-by-id.js',
  'update': 'test-update-skill.js',
  'delete': 'test-delete-skill.js',
  'all': 'test-all-skills.js'
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
  console.log('🧪 Starting Skills API Tests...\n');
  console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
  console.log('');

  try {
    // Import test modules
    const createTests = require('./skill/test-create-skill');
    const getAllTests = require('./skill/test-get-all-skills');
    const getByIdTests = require('./skill/test-get-skill-by-id');
    const updateTests = require('./skill/test-update-skill');
    const deleteTests = require('./skill/test-delete-skill');
    const allTests = require('./skill/test-all-skills');

    // Run all test suites
    await runTestModule('Create Skill Tests', createTests);
    await runTestModule('Get All Skills Tests', getAllTests);
    await runTestModule('Get Skill by ID Tests', getByIdTests);
    await runTestModule('Update Skill Tests', updateTests);
    await runTestModule('Delete Skill Tests', deleteTests);
    await runTestModule('All Skills Tests', allTests);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏆 SKILLS API TESTS SUMMARY');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Skills APIs are working correctly.');
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

async function runSpecificTest(testName) {
  if (!SCRIPTS[testName]) {
    console.error(`❌ Unknown test: ${testName}`);
    console.log('Available tests:', Object.keys(SCRIPTS).join(', '));
    process.exit(1);
  }

  try {
    const testModule = require(`./skill/${SCRIPTS[testName].replace('.js', '')}`);
    const result = await runTestModule(`${testName} Test`, testModule);
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