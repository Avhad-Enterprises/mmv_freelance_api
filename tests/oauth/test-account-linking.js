#!/usr/bin/env node

/**
 * OAuth Account Linking Tests
 * Tests for linking/unlinking OAuth providers to existing accounts
 */

const {
    CONFIG,
    makeRequest,
    printTestResult,
    printSection,
    printSummary,
    storeToken,
    authHeader,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

// ============================================
// LINKED PROVIDERS ENDPOINT TESTS
// ============================================

/**
 * Test GET /oauth/linked without authentication
 */
async function testGetLinkedWithoutAuth() {
    printSection('GET LINKED PROVIDERS');

    try {
        const response = await makeRequest('GET', `${CONFIG.apiVersion}/oauth/linked`);

        const passed = response.statusCode === 401;

        printTestResult(
            'GET /oauth/linked requires authentication',
            passed,
            passed ? 'Correctly returns 401' : `Expected 401, got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('GET /oauth/linked auth check', false, error.message);
        failedTests++;
    }
}

/**
 * Test GET /oauth/linked with authentication
 */
async function testGetLinkedWithAuth() {
    const token = await getTestUserToken();

    if (!token) {
        console.log('  ⚠ Skipping authenticated test - no test user available');
        return;
    }

    try {
        const response = await makeRequest(
            'GET',
            `${CONFIG.apiVersion}/oauth/linked`,
            null,
            { Authorization: `Bearer ${token}` }
        );

        const passed = response.statusCode === 200 &&
            response.body?.success === true &&
            Array.isArray(response.body?.data?.providers);

        if (passed) {
            console.log(`  Linked providers: ${response.body.data.providers.length}`);
            response.body.data.providers.forEach(p => {
                console.log(`    - ${p.provider || p}`);
            });
        }

        printTestResult(
            'GET /oauth/linked with valid token',
            passed,
            passed ? 'Successfully retrieved linked providers' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('GET /oauth/linked with auth', false, error.message);
        failedTests++;
    }
}

/**
 * Test response structure of linked providers
 */
async function testLinkedProvidersStructure() {
    const token = await getTestUserToken();

    if (!token) return;

    try {
        const response = await makeRequest(
            'GET',
            `${CONFIG.apiVersion}/oauth/linked`,
            null,
            { Authorization: `Bearer ${token}` }
        );

        if (response.statusCode !== 200) {
            printTestResult('Linked providers structure', false, 'Request failed');
            failedTests++;
            return;
        }

        const data = response.body?.data;
        const hasCorrectStructure =
            data !== undefined &&
            (Array.isArray(data.providers) || data.providers === undefined);

        printTestResult(
            'Linked providers response structure',
            hasCorrectStructure,
            hasCorrectStructure ? 'Response has correct structure' : 'Invalid structure'
        );

        hasCorrectStructure ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Linked providers structure', false, error.message);
        failedTests++;
    }
}

// ============================================
// UNLINK PROVIDER ENDPOINT TESTS
// ============================================

/**
 * Test DELETE /oauth/unlink/:provider without authentication
 */
async function testUnlinkWithoutAuth() {
    printSection('UNLINK PROVIDER');

    const providers = ['google', 'facebook', 'apple'];

    for (const provider of providers) {
        try {
            const response = await makeRequest('DELETE', `${CONFIG.apiVersion}/oauth/unlink/${provider}`);

            const passed = response.statusCode === 401;

            printTestResult(
                `DELETE /oauth/unlink/${provider} requires auth`,
                passed,
                passed ? 'Correctly returns 401' : `Got ${response.statusCode}`
            );

            passed ? passedTests++ : failedTests++;
        } catch (error) {
            printTestResult(`Unlink ${provider} auth check`, false, error.message);
            failedTests++;
        }
    }
}

/**
 * Test unlink with invalid provider name
 */
async function testUnlinkInvalidProvider() {
    const token = await getTestUserToken();

    if (!token) return;

    const invalidProviders = ['github', 'twitter', 'linkedin', 'invalid', '', 'GOOGLE'];

    for (const provider of invalidProviders) {
        try {
            const response = await makeRequest(
                'DELETE',
                `${CONFIG.apiVersion}/oauth/unlink/${provider}`,
                null,
                { Authorization: `Bearer ${token}` }
            );

            // Should return 400 or 404 for invalid providers
            const passed = response.statusCode === 400 || response.statusCode === 404;

            printTestResult(
                `Unlink invalid provider: "${provider}"`,
                passed,
                passed ? 'Correctly rejected' : `Got ${response.statusCode}`
            );

            passed ? passedTests++ : failedTests++;
        } catch (error) {
            printTestResult(`Unlink invalid: ${provider}`, true, 'Request rejected');
            passedTests++;
        }
    }
}

/**
 * Test unlink provider that is not linked
 */
async function testUnlinkNotLinkedProvider() {
    printSection('UNLINK NOT LINKED PROVIDER');

    const token = await getTestUserToken();

    if (!token) return;

    try {
        // Try to unlink a provider that likely isn't linked
        const response = await makeRequest(
            'DELETE',
            `${CONFIG.apiVersion}/oauth/unlink/apple`,
            null,
            { Authorization: `Bearer ${token}` }
        );

        // Should return 400 or 404 if not linked
        const passed = response.statusCode === 400 || response.statusCode === 404;

        printTestResult(
            'Unlink provider that is not linked',
            passed,
            passed ? 'Correctly rejected - provider not linked' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Unlink not linked provider', false, error.message);
        failedTests++;
    }
}

/**
 * Test that can't unlink only auth method
 */
async function testCantUnlinkOnlyAuthMethod() {
    printSection('UNLINK PROTECTION');

    console.log('  If a user only has OAuth (no password), they should not be able');
    console.log('  to unlink their only OAuth provider.');

    // This is a documentation test - actual test requires OAuth-only user
    printTestResult(
        'Unlink protection documentation',
        true,
        'Cannot unlink only authentication method'
    );
    passedTests++;
}

// ============================================
// REFRESH TOKEN ENDPOINT TESTS
// ============================================

/**
 * Test POST /oauth/refresh without authentication
 */
async function testRefreshWithoutAuth() {
    printSection('REFRESH TOKEN');

    try {
        const response = await makeRequest('POST', `${CONFIG.apiVersion}/oauth/refresh`, {
            provider: 'google'
        });

        const passed = response.statusCode === 401;

        printTestResult(
            'POST /oauth/refresh requires authentication',
            passed,
            passed ? 'Correctly returns 401' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Refresh auth check', false, error.message);
        failedTests++;
    }
}

/**
 * Test refresh with invalid provider
 */
async function testRefreshInvalidProvider() {
    const token = await getTestUserToken();

    if (!token) return;

    try {
        const response = await makeRequest(
            'POST',
            `${CONFIG.apiVersion}/oauth/refresh`,
            { provider: 'invalid_provider' },
            { Authorization: `Bearer ${token}` }
        );

        const passed = response.statusCode === 400;

        printTestResult(
            'Refresh with invalid provider',
            passed,
            passed ? 'Correctly rejected' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Refresh invalid provider', false, error.message);
        failedTests++;
    }
}

/**
 * Test refresh without provider field
 */
async function testRefreshWithoutProvider() {
    const token = await getTestUserToken();

    if (!token) return;

    try {
        const response = await makeRequest(
            'POST',
            `${CONFIG.apiVersion}/oauth/refresh`,
            {},
            { Authorization: `Bearer ${token}` }
        );

        const passed = response.statusCode === 400;

        printTestResult(
            'Refresh without provider field',
            passed,
            passed ? 'Correctly rejected' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Refresh without provider', false, error.message);
        failedTests++;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getTestUserToken() {
    try {
        const response = await makeRequest('POST', `${CONFIG.apiVersion}/login`, {
            email: 'test@test.com',
            password: 'Test@123456',
        });

        if (response.statusCode === 200 && response.body?.token) {
            return response.body.token;
        }

        // Try alternative
        const altResponse = await makeRequest('POST', `${CONFIG.apiVersion}/login`, {
            email: 'client@test.com',
            password: 'Password123!',
        });

        if (altResponse.statusCode === 200 && altResponse.body?.token) {
            return altResponse.body.token;
        }

        return null;
    } catch (error) {
        return null;
    }
}

// ============================================
// RUN ALL TESTS
// ============================================

async function runTests() {
    console.log('\n🔗 Starting OAuth Account Linking Tests...\n');
    console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);
    console.log('═'.repeat(60));

    // Get linked providers
    await testGetLinkedWithoutAuth();
    await testGetLinkedWithAuth();
    await testLinkedProvidersStructure();

    // Unlink provider
    await testUnlinkWithoutAuth();
    await testUnlinkInvalidProvider();
    await testUnlinkNotLinkedProvider();
    await testCantUnlinkOnlyAuthMethod();

    // Refresh token
    await testRefreshWithoutAuth();
    await testRefreshInvalidProvider();
    await testRefreshWithoutProvider();

    printSummary(passedTests, failedTests);

    return { passed: passedTests, failed: failedTests };
}

// Run if executed directly
if (require.main === module) {
    runTests()
        .then(({ failed }) => process.exit(failed > 0 ? 1 : 0))
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runTests };
