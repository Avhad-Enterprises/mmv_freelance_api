#!/usr/bin/env node

/**
 * Complete Applied Projects API Test Suite Runner
 *
 * This script runs all applied projects-related tests:
 * - Apply to project
 * - Get application count
 * - Get applications by status
 * - Get applied count
 * - Get completed projects count
 * - Get completed projects
 * - Get my application by project ID
 * - Get my applications
 * - Get ongoing projects
 * - Get project applications
 * - Update application status
 * - Withdraw application
 *
 * Usage: node tests/applied_projects/run-applied-projects-tests.js
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
    await testModule();

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
async function runAllAppliedProjectsTests() {
  console.log('📋 Starting Complete Applied Projects API Test Suite...\n');
  console.log('=' .repeat(60));

  try {
    // Import test modules
    const applyToProjectTests = require('./test-apply-to-project').testApplyToProject;
    const getApplicationCountTests = require('./test-get-application-count').testGetApplicationCount;
    const getApplicationsByStatusTests = require('./test-get-applications-by-status').testGetApplicationsByStatus;
    const getAppliedCountTests = require('./test-get-applied-count').testGetAppliedCount;
    const getCompletedProjectsCountTests = require('./test-get-completed-projects-count').testGetCompletedProjectsCount;
    const getCompletedProjectsTests = require('./test-get-completed-projects').testGetCompletedProjects;
    const getMyApplicationByProjectIdTests = require('./test-get-my-application-by-project-id').testGetMyApplicationByProjectId;
    const getMyApplicationsTests = require('./test-get-my-applications').testGetMyApplications;
    const getOngoingProjectsTests = require('./test-get-ongoing-projects').testGetOngoingProjects;
    const getProjectApplicationsTests = require('./test-get-project-applications').testGetProjectApplications;
    const updateApplicationStatusTests = require('./test-update-application-status').testUpdateApplicationStatus;
    const withdrawApplicationTests = require('./test-withdraw-application').testWithdrawApplication;

    // Run all test suites
    const results = [];
    results.push(await runTestModule('Apply to Project Tests', applyToProjectTests));
    results.push(await runTestModule('Get Application Count Tests', getApplicationCountTests));
    results.push(await runTestModule('Get Applications by Status Tests', getApplicationsByStatusTests));
    results.push(await runTestModule('Get Applied Count Tests', getAppliedCountTests));
    results.push(await runTestModule('Get Completed Projects Count Tests', getCompletedProjectsCountTests));
    results.push(await runTestModule('Get Completed Projects Tests', getCompletedProjectsTests));
    results.push(await runTestModule('Get My Application by Project ID Tests', getMyApplicationByProjectIdTests));
    results.push(await runTestModule('Get My Applications Tests', getMyApplicationsTests));
    results.push(await runTestModule('Get Ongoing Projects Tests', getOngoingProjectsTests));
    results.push(await runTestModule('Get Project Applications Tests', getProjectApplicationsTests));
    results.push(await runTestModule('Update Application Status Tests', updateApplicationStatusTests));
    results.push(await runTestModule('Withdraw Application Tests', withdrawApplicationTests));

    // Accumulate all results
    totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
    totalFailed = results.reduce((sum, result) => sum + result.failed, 0);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏁 APPLIED PROJECTS TEST SUITE COMPLETE');
    console.log('='.repeat(60));

    printSummary(totalPassed, totalFailed, totalPassed + totalFailed);

    // Exit with appropriate code
    if (totalFailed === 0) {
      console.log('\n✅ All applied projects tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some applied projects tests failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllAppliedProjectsTests();
}

module.exports = {
  runAllAppliedProjectsTests
};