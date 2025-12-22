#!/usr/bin/env node

/**
 * Credits Feature - Main Test Runner
 * Runs all credit-related tests
 * 
 * Usage:
 *   node tests/credits/run-credits-tests.js           # Run all tests
 *   node tests/credits/run-credits-tests.js api       # Run only API tests
 *   node tests/credits/run-credits-tests.js security  # Run only security tests
 *   node tests/credits/run-credits-tests.js admin     # Run only admin tests
 *   node tests/credits/run-credits-tests.js integration # Run only integration tests
 */

const path = require('path');
const fs = require('fs');

const {
  COLORS,
  printSection,
  printSummary,
} = require('../test-utils');

// Test modules organized by category
const TEST_SUITES = {
  api: [
    { name: 'Balance API', path: './api/test-balance-api.js' },
    { name: 'Packages API', path: './api/test-packages-api.js' },
    { name: 'Initiate Purchase API', path: './api/test-initiate-purchase-api.js' },
    { name: 'History API', path: './api/test-history-api.js' },
    { name: 'Refund Eligibility API', path: './api/test-refund-eligibility-api.js' },
    { name: 'Refunds History API', path: './api/test-refunds-api.js' },
  ],
  security: [
    { name: 'Auth Protection', path: './security/test-auth-protection.js' },
    { name: 'Rate Limiting', path: './security/test-rate-limiting.js' },
    { name: 'Ownership Validation', path: './security/test-ownership-validation.js' },
  ],
  admin: [
    { name: 'Admin Transactions API', path: './admin/test-admin-transactions-api.js' },
    { name: 'Admin Analytics API', path: './admin/test-admin-analytics-api.js' },
    { name: 'Admin Adjust API', path: './admin/test-admin-adjust-api.js' },
    { name: 'Admin User Credits API', path: './admin/test-admin-user-credits-api.js' },
    { name: 'Admin Refund Project API', path: './admin/test-admin-refund-project-api.js' },
    { name: 'Admin Export API', path: './admin/test-admin-export-api.js' },
  ],
  integration: [
    { name: 'Purchase Flow', path: './integration/test-purchase-flow.js' },
  ],
};

// Results tracking
let totalPassed = 0;
let totalFailed = 0;
const results = [];

/**
 * Run a single test suite
 */
async function runTestSuite(suite) {
  const modulePath = path.join(__dirname, suite.path);

  if (!fs.existsSync(modulePath)) {
    console.log(`${COLORS.yellow}⚠ Skipping ${suite.name}: File not found${COLORS.reset}`);
    return null;
  }

  try {
    console.log(`\n${COLORS.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
    console.log(`${COLORS.blue}Running: ${suite.name}${COLORS.reset}`);
    console.log(`${COLORS.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

    // Clear require cache to ensure fresh run
    delete require.cache[require.resolve(modulePath)];

    const testModule = require(modulePath);
    const result = await testModule.runTests();

    return {
      name: suite.name,
      passed: result.passed,
      failed: result.failed
    };
  } catch (error) {
    console.error(`${COLORS.red}Error running ${suite.name}:${COLORS.reset}`, error.message);
    return {
      name: suite.name,
      passed: 0,
      failed: 1,
      error: error.message
    };
  }
}

/**
 * Run all tests in a category
 */
async function runCategory(categoryName) {
  const suites = TEST_SUITES[categoryName];

  if (!suites || suites.length === 0) {
    console.log(`${COLORS.yellow}No tests found for category: ${categoryName}${COLORS.reset}`);
    return;
  }

  console.log(`\n${COLORS.blue}╔══════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║  ${categoryName.toUpperCase().padEnd(55)}║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚══════════════════════════════════════════════════════════╝${COLORS.reset}`);

  for (const suite of suites) {
    const result = await runTestSuite(suite);
    if (result) {
      results.push(result);
      totalPassed += result.passed;
      totalFailed += result.failed;
    }
  }
}

/**
 * Print final results
 */
function printFinalResults() {
  console.log(`\n${COLORS.blue}╔══════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║                    FINAL RESULTS                          ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

  // Individual suite results
  console.log('Suite Results:');
  console.log('──────────────────────────────────────────────────────────');
  for (const result of results) {
    const status = result.failed === 0
      ? `${COLORS.green}✓ PASS${COLORS.reset}`
      : `${COLORS.red}✗ FAIL${COLORS.reset}`;
    const padded = result.name.padEnd(35);
    console.log(`  ${status} ${padded} ${result.passed} passed, ${result.failed} failed`);
  }

  // Overall summary
  console.log('──────────────────────────────────────────────────────────');
  const total = totalPassed + totalFailed;
  const successRate = total > 0 ? ((totalPassed / total) * 100).toFixed(1) : 0;

  console.log(`\n${COLORS.blue}OVERALL:${COLORS.reset}`);
  console.log(`  Total Suites: ${results.length}`);
  console.log(`  Total Tests:  ${total}`);
  console.log(`  ${COLORS.green}Passed: ${totalPassed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed: ${totalFailed}${COLORS.reset}`);
  console.log(`  Success Rate: ${successRate}%`);

  if (totalFailed === 0) {
    console.log(`\n${COLORS.green}🎉 ALL TESTS PASSED!${COLORS.reset}\n`);
  } else {
    console.log(`\n${COLORS.red}❌ SOME TESTS FAILED${COLORS.reset}\n`);
  }
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
${COLORS.blue}Credits Test Runner${COLORS.reset}

Usage:
  node tests/credits/run-credits-tests.js [category]

Categories:
  ${COLORS.green}api${COLORS.reset}          Run API endpoint tests (balance, packages, purchase, history, refunds)
  ${COLORS.green}security${COLORS.reset}     Run security tests (auth, rate limiting, ownership)
  ${COLORS.green}admin${COLORS.reset}        Run admin API tests (transactions, analytics, adjust, export)
  ${COLORS.green}integration${COLORS.reset}  Run integration tests (purchase flow)
  ${COLORS.green}all${COLORS.reset}          Run all tests (default)

Examples:
  node tests/credits/run-credits-tests.js           # Run all
  node tests/credits/run-credits-tests.js api       # Run only API tests
  node tests/credits/run-credits-tests.js security  # Run only security tests

Test Count:
  API Tests:         6 suites (~35 tests)
  Security Tests:    3 suites (~34 tests)
  Admin Tests:       6 suites (~40 tests)
  Integration Tests: 1 suite  (~7 tests)
  ─────────────────────────────────────
  Total:            16 suites (~116 tests)
`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const category = args[0]?.toLowerCase();

  if (category === 'help' || category === '--help' || category === '-h') {
    printHelp();
    process.exit(0);
  }

  console.log(`${COLORS.blue}╔══════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║       CREDITS FEATURE - COMPREHENSIVE TEST SUITE          ║${COLORS.reset}`);
  console.log(`${COLORS.blue}║       ${new Date().toISOString()}                  ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚══════════════════════════════════════════════════════════╝${COLORS.reset}`);

  const startTime = Date.now();

  if (category && TEST_SUITES[category]) {
    // Run specific category
    await runCategory(category);
  } else if (category === 'all' || !category) {
    // Run all categories
    for (const cat of Object.keys(TEST_SUITES)) {
      if (TEST_SUITES[cat].length > 0) {
        await runCategory(cat);
      }
    }
  } else {
    console.log(`${COLORS.red}Unknown category: ${category}${COLORS.reset}`);
    console.log(`Available categories: ${Object.keys(TEST_SUITES).join(', ')}, all`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  printFinalResults();
  console.log(`${COLORS.gray}Completed in ${duration}s${COLORS.reset}\n`);

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});