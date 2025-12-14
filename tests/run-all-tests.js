#!/usr/bin/env node

/**
 * Run All Tests
 * Master test runner that executes all test suites
 */

const { spawn } = require('child_process');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

// Test files to run (organized by feature subdirectory)
const TEST_FILES = [
  // Auth tests
  'auth/test-login.js',
  'auth/test-client-registration.js',
  'auth/test-videographer-registration.js',
  'auth/test-videoeditor-registration.js',

  // User management tests
  'user/test-user-routes.js',
  'user/test-get-all-users.js',
  'user/test-get-my-profile.js',
  'user/test-ban-user.js',
  'user/test-change-password.js',

  // Project task tests
  'projectstask/test-insert-project-task.js',
  'projectstask/test-get-all-project-tasks.js',
  'projectstask/test-get-project-task-by-id.js',
  'projectstask/test-get-public-project-listings.js',
  'projectstask/test-update-project-task.js',
  'projectstask/test-delete-project-task.js',

  // RBAC tests
  'rbac/test-rbac-complete.js',

  // Client tests
  'clients/test-client-routes.js',

  // Freelancer tests
  'freelancers/test-get-all-freelancers.js',
  'freelancers/test-get-all-freelancers-public.js',

  // Applied projects tests
  'applied_projects/test-apply-to-project.js',
  'applied_projects/test-get-my-applications.js',

  // Favorites tests
  'favorites/test-add-favorite.js',
  'favorites/test-get-my-favorites.js',

  // Category tests
  'category/test-get-all-categories.js',
  'category/test-create-category.js',

  // Skill tests
  'skill/test-get-all-skills.js',

  // Blog tests
  'blog/test-get-all-blogs.js',

  // FAQ tests
  'faq/test-get-all-faqs.js',

  // Contact tests
  'contact/test-contact-submit.js',

  // OAuth tests (comprehensive)
  'oauth/test-oauth-flow.js',
  'oauth/test-role-selection.js',
  'oauth/test-account-linking.js',
  'oauth/test-oauth-security.js',
];

// Test results
const results = {
  passed: [],
  failed: [],
  errors: [],
};

/**
 * Run a single test file
 */
function runTestFile(testFile) {
  return new Promise((resolve) => {
    console.log(`\n${COLORS.blue}${COLORS.bold}Running: ${testFile}${COLORS.reset}`);
    console.log(`${COLORS.blue}${'='.repeat(80)}${COLORS.reset}\n`);

    const testPath = path.join(__dirname, testFile);
    const isTypeScript = testFile.endsWith('.ts');
    const command = isTypeScript ? 'npx' : 'node';
    const args = isTypeScript ? ['ts-node', testPath] : [testPath];

    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env },
    });

    child.on('close', (code) => {
      if (code === 0) {
        results.passed.push(testFile);
        console.log(`\n${COLORS.green}✅ ${testFile} - PASSED${COLORS.reset}`);
      } else {
        results.failed.push(testFile);
        console.log(`\n${COLORS.red}❌ ${testFile} - FAILED (exit code: ${code})${COLORS.reset}`);
      }
      resolve(code);
    });

    child.on('error', (error) => {
      results.errors.push({ file: testFile, error: error.message });
      console.log(`\n${COLORS.red}💥 ${testFile} - ERROR: ${error.message}${COLORS.reset}`);
      resolve(1);
    });
  });
}

/**
 * Run all test files sequentially
 */
async function runAllTests() {
  console.log(`${COLORS.bold}${COLORS.blue}🧪 MMV Freelance API - Test Suite Runner${COLORS.reset}`);
  console.log(`${COLORS.blue}${'='.repeat(80)}${COLORS.reset}`);
  console.log(`${COLORS.bold}📅 Started: ${new Date().toISOString()}${COLORS.reset}`);
  console.log(`${COLORS.bold}🎯 Tests to run: ${TEST_FILES.length}${COLORS.reset}`);
  console.log(`${COLORS.blue}${'='.repeat(80)}${COLORS.reset}`);

  // Run each test file
  for (const testFile of TEST_FILES) {
    await runTestFile(testFile);
  }

  // Print final summary
  console.log(`\n${COLORS.bold}${COLORS.blue}📊 FINAL SUMMARY${COLORS.reset}`);
  console.log(`${COLORS.blue}${'='.repeat(80)}${COLORS.reset}`);

  console.log(`${COLORS.green}✅ Passed: ${results.passed.length}${COLORS.reset}`);
  results.passed.forEach(file => {
    console.log(`  ${COLORS.green}- ${file}${COLORS.reset}`);
  });

  if (results.failed.length > 0) {
    console.log(`\n${COLORS.red}❌ Failed: ${results.failed.length}${COLORS.reset}`);
    results.failed.forEach(file => {
      console.log(`  ${COLORS.red}- ${file}${COLORS.reset}`);
    });
  }

  if (results.errors.length > 0) {
    console.log(`\n${COLORS.yellow}💥 Errors: ${results.errors.length}${COLORS.reset}`);
    results.errors.forEach(({ file, error }) => {
      console.log(`  ${COLORS.yellow}- ${file}: ${error}${COLORS.reset}`);
    });
  }

  const totalTests = TEST_FILES.length;
  const passedTests = results.passed.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\n${COLORS.bold}📈 Success Rate: ${passedTests}/${totalTests} (${successRate}%)${COLORS.reset}`);
  console.log(`${COLORS.bold}📅 Completed: ${new Date().toISOString()}${COLORS.reset}`);
  console.log(`${COLORS.blue}${'='.repeat(80)}${COLORS.reset}`);

  // Exit with appropriate code
  const exitCode = results.failed.length === 0 && results.errors.length === 0 ? 0 : 1;
  process.exit(exitCode);
}

// Run all tests
runAllTests().catch(error => {
  console.error(`${COLORS.red}Fatal error running tests:${COLORS.reset}`, error);
  process.exit(1);
});