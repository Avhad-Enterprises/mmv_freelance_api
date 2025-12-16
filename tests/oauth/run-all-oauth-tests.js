#!/usr/bin/env node

/**
 * OAuth Test Suite Runner
 * Runs all OAuth-related tests and provides comprehensive summary
 */

const { COLORS, printSection, printSummary } = require('../test-utils');

// Test modules
const oauthFlowTests = require('./test-oauth-flow');
const roleSelectionTests = require('./test-role-selection');
const accountLinkingTests = require('./test-account-linking');

// Store results
const testResults = {
    oauthFlow: { passed: 0, failed: 0 },
    roleSelection: { passed: 0, failed: 0 },
    accountLinking: { passed: 0, failed: 0 },
};

/**
 * Print section separator
 */
function printLargeSeparator(title) {
    console.log('\n');
    console.log(`${COLORS.blue}${'═'.repeat(70)}${COLORS.reset}`);
    console.log(`${COLORS.blue}║  ${title.padEnd(66)}║${COLORS.reset}`);
    console.log(`${COLORS.blue}${'═'.repeat(70)}${COLORS.reset}`);
}

/**
 * Print final comprehensive summary
 */
function printComprehensiveSummary() {
    const totalPassed = Object.values(testResults).reduce((acc, r) => acc + r.passed, 0);
    const totalFailed = Object.values(testResults).reduce((acc, r) => acc + r.failed, 0);
    const total = totalPassed + totalFailed;

    console.log('\n');
    console.log(`${COLORS.blue}${'═'.repeat(70)}${COLORS.reset}`);
    console.log(`${COLORS.blue}║${'COMPREHENSIVE OAUTH TEST SUMMARY'.padStart(45).padEnd(68)}║${COLORS.reset}`);
    console.log(`${COLORS.blue}${'═'.repeat(70)}${COLORS.reset}`);
    console.log();

    // Individual suite results
    const suites = [
        { name: 'OAuth Flow Tests', key: 'oauthFlow' },
        { name: 'Role Selection Tests', key: 'roleSelection' },
        { name: 'Account Linking Tests', key: 'accountLinking' },
    ];

    console.log(`  ${'Suite'.padEnd(35)} ${'Passed'.padStart(8)} ${'Failed'.padStart(8)} ${'Status'.padStart(10)}`);
    console.log(`  ${'-'.repeat(35)} ${'-'.repeat(8)} ${'-'.repeat(8)} ${'-'.repeat(10)}`);

    for (const suite of suites) {
        const result = testResults[suite.key];
        const status = result.failed === 0
            ? `${COLORS.green}✓ PASS${COLORS.reset}`
            : `${COLORS.red}✗ FAIL${COLORS.reset}`;

        console.log(
            `  ${suite.name.padEnd(35)} ` +
            `${COLORS.green}${result.passed.toString().padStart(8)}${COLORS.reset} ` +
            `${COLORS.red}${result.failed.toString().padStart(8)}${COLORS.reset} ` +
            `${status.padStart(20)}`
        );
    }

    console.log();
    console.log(`  ${'-'.repeat(63)}`);
    console.log(
        `  ${'TOTAL'.padEnd(35)} ` +
        `${COLORS.green}${totalPassed.toString().padStart(8)}${COLORS.reset} ` +
        `${COLORS.red}${totalFailed.toString().padStart(8)}${COLORS.reset}`
    );
    console.log();

    // Overall result
    const overallPassed = totalFailed === 0;
    const percentage = total > 0 ? Math.round((totalPassed / total) * 100) : 0;

    if (overallPassed) {
        console.log(`  ${COLORS.green}✓ ALL TESTS PASSED! (${percentage}%)${COLORS.reset}`);
    } else {
        console.log(`  ${COLORS.red}✗ ${totalFailed} TEST(S) FAILED (${percentage}% passed)${COLORS.reset}`);
    }

    console.log();
    console.log(`${COLORS.blue}${'═'.repeat(70)}${COLORS.reset}`);

    // Test coverage summary
    console.log();
    console.log(`${COLORS.blue}Test Coverage:${COLORS.reset}`);
    console.log('  ✓ Provider endpoints (Google, Facebook, Apple)');
    console.log('  ✓ OAuth redirect validation');
    console.log('  ✓ Callback CSRF protection');
    console.log('  ✓ Protected endpoint authentication');
    console.log('  ✓ Role selection flow');
    console.log('  ✓ Account linking/unlinking');
    console.log('  ✓ Token refresh');
    console.log('  ✓ Error handling');
    console.log('  ✓ Edge cases');
    console.log();

    return { passed: totalPassed, failed: totalFailed };
}

/**
 * Run all OAuth tests
 */
async function runAllTests() {
    console.log(`\n${COLORS.blue}${'═'.repeat(70)}${COLORS.reset}`);
    console.log(`${COLORS.blue}║${'OAuth Complete Test Suite'.padStart(45).padEnd(68)}║${COLORS.reset}`);
    console.log(`${COLORS.blue}${'═'.repeat(70)}${COLORS.reset}`);
    console.log(`\nStarting at: ${new Date().toISOString()}\n`);

    try {
        // Test Suite 1: OAuth Flow
        printLargeSeparator('TEST SUITE 1: OAuth Flow Tests');
        testResults.oauthFlow = await oauthFlowTests.runTests();

        // Test Suite 2: Role Selection
        printLargeSeparator('TEST SUITE 2: Role Selection Tests');
        testResults.roleSelection = await roleSelectionTests.runTests();

        // Test Suite 3: Account Linking
        printLargeSeparator('TEST SUITE 3: Account Linking Tests');
        testResults.accountLinking = await accountLinkingTests.runTests();

    } catch (error) {
        console.error(`\n${COLORS.red}Test suite failed with error:${COLORS.reset}`, error);
    }

    // Print comprehensive summary
    const { failed } = printComprehensiveSummary();

    console.log(`Completed at: ${new Date().toISOString()}`);
    console.log();

    return failed;
}

// Run if executed directly
if (require.main === module) {
    runAllTests()
        .then(failedCount => {
            process.exit(failedCount > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('Test suite execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runAllTests };
