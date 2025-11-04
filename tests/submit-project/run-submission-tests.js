/**
 * Test Runner for Submit-Project Feature
 * 
 * This script runs all tests for the project submission endpoints.
 * 
 * Endpoints tested:
 * - POST /api/v1/projects-tasks/:id/submit (Submit project)
 * - PATCH /api/v1/projects-tasks/submissions/:submissionId/approve (Approve/reject submission)
 * - GET /api/v1/projects-tasks/submissions/:submissionId (Get submission by ID)
 * - GET /api/v1/projects-tasks/:projectId/submissions (Get submissions by project)
 * - GET /api/v1/projects-tasks/submissions/freelancer/:userId (Get submissions by freelancer)
 * - GET /api/v1/projects-tasks/submissions (Get all submissions with filters)
 * 
 * Usage:
 * cd tests/submit-project
 * node run-submission-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const testFiles = [
  'test-submit-project.js',
  'test-approve-submission.js',
  'test-get-submission-by-id.js',
  'test-get-submissions-by-project.js',
  'test-get-submissions-by-freelancer.js',
  'test-get-all-submissions.js',
];

console.log(`\n${colors.bright}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}   SUBMISSION FEATURE TEST SUITE${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}\n`);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestDetails = [];

testFiles.forEach((testFile, index) => {
  console.log(`${colors.bright}${colors.blue}[${index + 1}/${testFiles.length}] Running: ${testFile}${colors.reset}\n`);

  try {
    const output = execSync(`node ${testFile}`, {
      cwd: __dirname,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(output);

    // Parse test results
    const passMatches = output.match(/✅ PASSED \(\d+\/\d+\)/g);
    const failMatches = output.match(/❌ FAILED \(\d+\/\d+\)/g);

    if (passMatches) {
      passMatches.forEach(match => {
        const [current] = match.match(/\d+/g);
        passedTests += parseInt(current);
        totalTests += parseInt(current);
      });
    }

    if (failMatches) {
      failMatches.forEach(match => {
        const [current, total] = match.match(/\d+/g);
        failedTests += parseInt(current);
        totalTests += parseInt(total);
      });
      failedTestDetails.push({ file: testFile, output });
    }

  } catch (error) {
    console.log(`${colors.red}✗ Test file crashed: ${testFile}${colors.reset}`);
    console.log(error.stdout || error.message);
    failedTests++;
    totalTests++;
    failedTestDetails.push({ 
      file: testFile, 
      output: error.stdout || error.message 
    });
  }

  console.log(); // Empty line between tests
});

// Summary
console.log(`\n${colors.bright}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}   TEST SUMMARY${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}\n`);

console.log(`Total Tests:  ${colors.bright}${totalTests}${colors.reset}`);
console.log(`${colors.green}Passed:       ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed:       ${failedTests}${colors.reset}`);
console.log(`Success Rate: ${colors.bright}${((passedTests / totalTests) * 100).toFixed(1)}%${colors.reset}`);

if (failedTests === 0) {
  console.log(`\n${colors.bright}${colors.green}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.bright}${colors.red}❌ SOME TESTS FAILED${colors.reset}\n`);
  console.log(`${colors.yellow}Failed test files:${colors.reset}`);
  failedTestDetails.forEach(({ file }) => {
    console.log(`  - ${file}`);
  });
  console.log();
  process.exit(1);
}
