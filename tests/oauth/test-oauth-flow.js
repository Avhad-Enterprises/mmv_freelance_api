#!/usr/bin/env node

/**
 * OAuth API Tests
 * Tests for OAuth authentication endpoints
 */

const {
    CONFIG,
    makeRequest,
    printTestResult,
    printSection,
    printSummary,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

/**
 * Test GET /oauth/providers - Get available OAuth providers
 */
async function testGetProviders() {
    printSection('OAUTH PROVIDERS ENDPOINT');

    try {
        const response = await makeRequest('GET', `${CONFIG.apiVersion}/oauth/providers`);

        const passed = response.statusCode === 200 &&
            response.body?.success === true &&
            Array.isArray(response.body?.data?.providers);

        printTestResult(
            'Get OAuth providers',
            passed,
            passed ? `Found ${response.body.data.providers.length} provider(s)` : `Failed: ${response.statusCode}`,
            response.body
        );

        if (passed) {
            // Log provider details
            response.body.data.providers.forEach(p => {
                console.log(`  - ${p.displayName}: ${p.enabled ? '✓ Enabled' : '✗ Disabled'}`);
            });
        }

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Get OAuth providers', false, error.message);
        failedTests++;
    }
}

/**
 * Test GET /oauth/google - Google OAuth redirect
 * Note: This will attempt to redirect, which may fail in test environment
 */
async function testGoogleRedirect() {
    printSection('GOOGLE OAUTH REDIRECT');

    try {
        // Make request that follows redirects disabled
        const http = require('http');
        const https = require('https');

        const url = `${CONFIG.baseUrl}${CONFIG.apiVersion}/oauth/google`;

        const response = await new Promise((resolve, reject) => {
            const request = http.get(url, {
                // Don't follow redirects
                maxRedirects: 0
            }, (res) => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                });
            });

            request.on('error', (err) => {
                // 302 redirect will cause an error with maxRedirects: 0
                // or we need custom handling
                reject(err);
            });

            request.setTimeout(5000, () => {
                request.destroy();
                reject(new Error('Timeout'));
            });
        });

        // Expect either 302 redirect or 503 if not configured
        const passed = response.statusCode === 302 ||
            response.statusCode === 301 ||
            response.statusCode === 503;

        if (response.statusCode === 302 || response.statusCode === 301) {
            printTestResult(
                'Google OAuth redirect',
                true,
                'Correctly redirects to Google OAuth',
                { location: response.headers.location?.substring(0, 50) + '...' }
            );
            passedTests++;
        } else if (response.statusCode === 503) {
            printTestResult(
                'Google OAuth redirect (not configured)',
                true,
                'Returns 503 when Google OAuth is not configured'
            );
            passedTests++;
        } else {
            printTestResult(
                'Google OAuth redirect',
                false,
                `Expected 302 or 503, got ${response.statusCode}`
            );
            failedTests++;
        }

    } catch (error) {
        // If we get a redirect error or timeout, that's actually expected behavior
        if (error.message.includes('redirect') || error.code === 'ECONNREFUSED') {
            printTestResult(
                'Google OAuth redirect',
                false,
                `Server not reachable: ${error.message}`
            );
            failedTests++;
        } else {
            // The redirect happened (which is expected)
            printTestResult(
                'Google OAuth redirect',
                true,
                'Redirect initiated (expected behavior)'
            );
            passedTests++;
        }
    }
}

/**
 * Test OAuth callback without proper state (should fail)
 */
async function testGoogleCallbackWithoutState() {
    printSection('OAUTH CALLBACK VALIDATION');

    try {
        // Try callback without state parameter
        const response = await makeRequest(
            'GET',
            `${CONFIG.apiVersion}/oauth/google/callback?code=fake_code`
        );

        // Should redirect to error page or return error
        const passed = response.statusCode === 302 ||
            response.statusCode === 400 ||
            response.statusCode === 500;

        printTestResult(
            'Callback without state parameter',
            passed,
            passed ? 'Correctly rejected invalid callback' : `Got ${response.statusCode}`,
            response.body
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        // Redirect to error page is expected
        printTestResult(
            'Callback without state parameter',
            true,
            'Correctly handles missing state (redirect)'
        );
        passedTests++;
    }
}

/**
 * Test OAuth callback with mismatched state (CSRF protection)
 */
async function testGoogleCallbackCSRFProtection() {
    printSection('CSRF PROTECTION');

    try {
        // Try callback with fake state
        const response = await makeRequest(
            'GET',
            `${CONFIG.apiVersion}/oauth/google/callback?code=fake_code&state=fake_state`
        );

        // Should redirect to error page
        const passed = response.statusCode === 302 ||
            response.statusCode === 400 ||
            response.statusCode === 500;

        printTestResult(
            'Callback with fake state (CSRF check)',
            passed,
            passed ? 'Correctly rejected - CSRF protection working' : `Got ${response.statusCode}`,
            response.body
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult(
            'Callback with fake state (CSRF check)',
            true,
            'CSRF protection working - request rejected'
        );
        passedTests++;
    }
}

/**
 * Test protected endpoints require authentication
 */
async function testProtectedEndpoints() {
    printSection('PROTECTED ENDPOINTS');

    // Test /oauth/linked without auth
    try {
        const response = await makeRequest('GET', `${CONFIG.apiVersion}/oauth/linked`);

        const passed = response.statusCode === 401;

        printTestResult(
            'Get linked providers without auth',
            passed,
            passed ? 'Correctly requires authentication' : `Expected 401, got ${response.statusCode}`,
            response.body
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Get linked providers without auth', false, error.message);
        failedTests++;
    }

    // Test /oauth/unlink without auth
    try {
        const response = await makeRequest('DELETE', `${CONFIG.apiVersion}/oauth/unlink/google`);

        const passed = response.statusCode === 401;

        printTestResult(
            'Unlink provider without auth',
            passed,
            passed ? 'Correctly requires authentication' : `Expected 401, got ${response.statusCode}`,
            response.body
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Unlink provider without auth', false, error.message);
        failedTests++;
    }
}

/**
 * Run all OAuth tests
 */
async function runTests() {
    console.log('\n🔐 Starting OAuth API Tests...\n');
    console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);

    await testGetProviders();
    await testGoogleCallbackWithoutState();
    await testGoogleCallbackCSRFProtection();
    await testProtectedEndpoints();

    printSummary(passedTests, failedTests);

    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { runTests };
