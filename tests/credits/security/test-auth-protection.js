#!/usr/bin/env node

/**
 * Credits Auth Protection Tests
 * Tests authentication and authorization for all credit endpoints
 */

const {
    CONFIG,
    makeRequest,
    printTestResult,
    printSection,
    printSummary,
    storeToken,
    authHeader,
    randomEmail
} = require('../../test-utils');

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

let passedTests = 0;
let failedTests = 0;

/**
 * Setup test users (videographer, client)
 */
async function setupTestUsers() {
    const testDir = path.join(__dirname, '..', '..', 'auth', 'test-files');
    const imagePath = path.join(testDir, 'test-profile.png');
    const pdfPath = path.join(testDir, 'test-id.pdf');

    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

    if (!fs.existsSync(imagePath)) {
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
            0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(imagePath, pngData);
    }

    if (!fs.existsSync(pdfPath)) {
        fs.writeFileSync(pdfPath, '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
    }

    // Setup Videographer
    const viEmail = randomEmail('auth-vi');
    const viForm = new FormData();
    viForm.append('first_name', 'AuthTest');
    viForm.append('last_name', 'Videographer');
    viForm.append('email', viEmail);
    viForm.append('password', 'Test@123456');
    viForm.append('skill_tags', JSON.stringify(['cinematography']));
    viForm.append('superpowers', JSON.stringify(['editing']));
    viForm.append('country', 'India');
    viForm.append('city', 'Mumbai');
    viForm.append('portfolio_links', JSON.stringify(['https://test.com']));
    viForm.append('phone_number', '+91-9876543210');
    viForm.append('id_type', 'passport');
    viForm.append('short_description', 'Test');
    viForm.append('languages', JSON.stringify(['English']));
    viForm.append('terms_accepted', 'true');
    viForm.append('privacy_policy_accepted', 'true');
    viForm.append('profile_photo', fs.createReadStream(imagePath));
    viForm.append('id_document', fs.createReadStream(pdfPath));

    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, viForm);
    const viLogin = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, { email: viEmail, password: 'Test@123456' });
    if (viLogin.body?.data?.token) storeToken('videographer', viLogin.body.data.token);

    // Setup Client
    const clEmail = randomEmail('auth-cl');
    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
        first_name: 'AuthTest',
        last_name: 'Client',
        email: clEmail,
        password: 'Test@123456',
        company_name: 'Test Corp',
        phone_number: '+91-9876543211',
        country: 'India',
        city: 'Delhi',
        terms_accepted: true,
        privacy_policy_accepted: true
    });
    const clLogin = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, { email: clEmail, password: 'Test@123456' });
    if (clLogin.body?.data?.token) storeToken('client', clLogin.body.data.token);

    return !!viLogin.body?.data?.token && !!clLogin.body?.data?.token;
}

// Credit endpoints to test
const CREDIT_ENDPOINTS = [
    { method: 'GET', path: '/credits/balance', name: 'Balance' },
    { method: 'GET', path: '/credits/packages', name: 'Packages' },
    { method: 'GET', path: '/credits/history', name: 'History' },
    { method: 'GET', path: '/credits/refunds', name: 'Refunds' },
    { method: 'POST', path: '/credits/initiate-purchase', name: 'Initiate Purchase', body: { credits_amount: 5 } },
];

/**
 * Test: All endpoints require authentication
 */
async function test_all_endpoints_require_auth() {
    printSection('Authentication Required Tests');

    for (const endpoint of CREDIT_ENDPOINTS) {
        const testName = `${endpoint.method} ${endpoint.path} requires auth → 401`;

        const response = await makeRequest(
            endpoint.method,
            `${CONFIG.apiVersion}${endpoint.path}`,
            endpoint.body || null
        );

        const passed = response.statusCode === 401;
        printTestResult(testName, passed, `Status: ${response.statusCode}`);
        passed ? passedTests++ : failedTests++;
    }
}

/**
 * Test: All endpoints reject client role
 */
async function test_all_endpoints_reject_client() {
    printSection('Role Authorization Tests (Client → 403)');

    for (const endpoint of CREDIT_ENDPOINTS) {
        const testName = `${endpoint.method} ${endpoint.path} rejects client → 403`;

        const response = await makeRequest(
            endpoint.method,
            `${CONFIG.apiVersion}${endpoint.path}`,
            endpoint.body || null,
            authHeader('client')
        );

        const passed = response.statusCode === 403;
        printTestResult(testName, passed, `Status: ${response.statusCode}`);
        passed ? passedTests++ : failedTests++;
    }
}

/**
 * Test: Freelancer endpoints accept videographer role
 */
async function test_all_endpoints_accept_videographer() {
    printSection('Role Authorization Tests (Videographer → 200)');

    for (const endpoint of CREDIT_ENDPOINTS) {
        const testName = `${endpoint.method} ${endpoint.path} accepts videographer → 200`;

        const response = await makeRequest(
            endpoint.method,
            `${CONFIG.apiVersion}${endpoint.path}`,
            endpoint.body || null,
            authHeader('videographer')
        );

        // Should get 200 (success) not 401/403
        const passed = response.statusCode === 200;
        printTestResult(testName, passed, `Status: ${response.statusCode}`);
        passed ? passedTests++ : failedTests++;
    }
}

/**
 * Test: Invalid token is rejected
 */
async function test_invalid_token_rejected() {
    printSection('Invalid Token Tests');

    const testName = 'GET /credits/balance with invalid token → 401';

    const response = await makeRequest(
        'GET',
        `${CONFIG.apiVersion}/credits/balance`,
        null,
        { Authorization: 'Bearer invalid_token_12345' }
    );

    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Malformed auth header rejected
 */
async function test_malformed_auth_header() {
    const testName = 'GET /credits/balance with malformed header → 401';

    const response = await makeRequest(
        'GET',
        `${CONFIG.apiVersion}/credits/balance`,
        null,
        { Authorization: 'not-a-bearer-token' }
    );

    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Admin endpoints reject non-admin users
 */
async function test_admin_endpoints_reject_freelancer() {
    printSection('Admin Endpoint Protection Tests');

    const adminEndpoints = [
        { method: 'GET', path: '/admin/credits/transactions', name: 'Transactions' },
        { method: 'GET', path: '/admin/credits/analytics', name: 'Analytics' },
        { method: 'POST', path: '/admin/credits/adjust', name: 'Adjust', body: { user_id: 1, amount: 5, reason: 'Test adjustment reason' } },
    ];

    for (const endpoint of adminEndpoints) {
        const testName = `${endpoint.method} ${endpoint.path} rejects freelancer → 403`;

        const response = await makeRequest(
            endpoint.method,
            `${CONFIG.apiVersion}${endpoint.path}`,
            endpoint.body || null,
            authHeader('videographer')
        );

        const passed = response.statusCode === 403;
        printTestResult(testName, passed, `Status: ${response.statusCode}`);
        passed ? passedTests++ : failedTests++;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS AUTH PROTECTION TESTS');

    console.log('Setting up test users...\n');
    const ready = await setupTestUsers();
    if (!ready) {
        console.log('❌ Failed to setup users. Aborting tests.');
        process.exit(1);
    }
    console.log('✅ Users ready\n');

    // Run all tests
    await test_all_endpoints_require_auth();
    await test_all_endpoints_reject_client();
    await test_all_endpoints_accept_videographer();
    await test_invalid_token_rejected();
    await test_malformed_auth_header();
    await test_admin_endpoints_reject_freelancer();

    printSummary(passedTests, failedTests);

    return { passed: passedTests, failed: failedTests };
}

if (require.main === module) {
    runTests()
        .then(({ failed }) => process.exit(failed > 0 ? 1 : 0))
        .catch(err => {
            console.error('Test runner failed:', err);
            process.exit(1);
        });
}

module.exports = { runTests };
