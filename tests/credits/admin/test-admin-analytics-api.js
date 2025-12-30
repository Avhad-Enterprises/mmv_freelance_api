#!/usr/bin/env node

/**
 * Admin Credits Analytics API Tests
 * Tests GET /api/v1/admin/credits/analytics endpoint
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
 * Setup test users
 */
async function setupTestUsers() {
    // Setup Videographer
    const testDir = path.join(__dirname, '..', '..', 'auth', 'test-files');
    const imagePath = path.join(testDir, 'test-profile.png');
    const pdfPath = path.join(testDir, 'test-id.pdf');

    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]));
    }
    if (!fs.existsSync(pdfPath)) {
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%%EOF');
    }

    const viEmail = randomEmail('analytics-vi');
    const viForm = new FormData();
    viForm.append('first_name', 'Analytics');
    viForm.append('last_name', 'Test');
    viForm.append('email', viEmail);
    viForm.append('password', 'Test@123456');
    viForm.append('skill_tags', JSON.stringify(['test']));
    viForm.append('superpowers', JSON.stringify(['test']));
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

    // Try admin login
    const adminLogin = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email: 'admin@mmvfreelance.com',
        password: 'Admin@123456'
    });
    if (adminLogin.body?.data?.token) storeToken('admin', adminLogin.body.data.token);

    return { hasAdmin: !!adminLogin.body?.data?.token };
}

/**
 * Test: GET without auth
 */
async function test_without_auth() {
    const testName = 'GET /admin/credits/analytics without auth → 401';
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/analytics`);
    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with non-admin role
 */
async function test_with_non_admin() {
    const testName = 'GET /admin/credits/analytics with videographer → 403';
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/analytics`, null, authHeader('videographer'));
    const passed = response.statusCode === 403;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with admin
 */
async function test_with_admin(hasAdmin) {
    const testName = 'GET /admin/credits/analytics with admin → 200';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin');
        failedTests++;
        return null;
    }

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/analytics`, null, authHeader('admin'));
    const passed = response.statusCode === 200;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Response has overview
 */
async function test_has_overview(response) {
    const testName = 'Response has overview with credits_in_circulation';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const overview = response.body?.data?.overview;
    const passed = overview &&
        typeof overview.credits_in_circulation === 'number' &&
        typeof overview.total_revenue_inr === 'number' &&
        typeof overview.price_per_credit === 'number';

    printTestResult(testName, passed,
        `Credits: ${overview?.credits_in_circulation}, Revenue: ₹${overview?.total_revenue_inr}, Price: ₹${overview?.price_per_credit}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response has transactions by type
 */
async function test_has_transactions_by_type(response) {
    const testName = 'Response has transactions_by_type array';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const passed = Array.isArray(response.body?.data?.transactions_by_type);
    printTestResult(testName, passed, `Is array: ${passed}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response has daily stats
 */
async function test_has_daily_stats(response) {
    const testName = 'Response has daily_stats array';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const passed = Array.isArray(response.body?.data?.daily_stats);
    printTestResult(testName, passed, `Is array: ${passed}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response has top users
 */
async function test_has_top_users(response) {
    const testName = 'Response has top_users array';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const passed = Array.isArray(response.body?.data?.top_users);
    printTestResult(testName, passed, `Is array: ${passed}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('ADMIN CREDITS ANALYTICS API TESTS');

    console.log('Setting up test users...\n');
    const { hasAdmin } = await setupTestUsers();
    console.log(hasAdmin ? '✅ Admin ready\n' : '⚠️ Admin not available\n');

    await test_without_auth();
    await test_with_non_admin();
    const response = await test_with_admin(hasAdmin);
    await test_has_overview(response);
    await test_has_transactions_by_type(response);
    await test_has_daily_stats(response);
    await test_has_top_users(response);

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
