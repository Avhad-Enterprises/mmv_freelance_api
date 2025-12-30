#!/usr/bin/env node

/**
 * Admin User Credits API Tests
 * Tests GET /api/v1/admin/credits/user/:user_id endpoint
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
let testUserId = null;

/**
 * Setup test users
 */
async function setupTestUsers() {
    const testDir = path.join(__dirname, '..', '..', 'auth', 'test-files');
    const imagePath = path.join(testDir, 'test-profile.png');
    const pdfPath = path.join(testDir, 'test-id.pdf');

    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    }
    if (!fs.existsSync(pdfPath)) {
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%%EOF');
    }

    // Create test user
    const viEmail = randomEmail('user-credits');
    const viForm = new FormData();
    viForm.append('first_name', 'UserCredits');
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
    if (viLogin.body?.data?.token) {
        storeToken('videographer', viLogin.body.data.token);
        testUserId = viLogin.body.data.user?.user_id;
    }

    // Try admin login
    const adminLogin = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email: 'admin@mmvfreelance.com',
        password: 'Admin@123456'
    });
    if (adminLogin.body?.data?.token) storeToken('admin', adminLogin.body.data.token);

    return { hasAdmin: !!adminLogin.body?.data?.token, userId: testUserId };
}

/**
 * Test: GET without auth
 */
async function test_without_auth() {
    const testName = 'GET /admin/credits/user/:id without auth → 401';
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/user/1`);
    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with non-admin
 */
async function test_with_non_admin() {
    const testName = 'GET /admin/credits/user/:id with videographer → 403';
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/user/1`, null, authHeader('videographer'));
    const passed = response.statusCode === 403;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with admin
 */
async function test_with_admin(hasAdmin, userId) {
    const testName = 'GET /admin/credits/user/:id with admin → 200';

    if (!hasAdmin || !userId) {
        printTestResult(testName, false, 'Skipped: No admin or user');
        failedTests++;
        return null;
    }

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/user/${userId}`, null, authHeader('admin'));
    const passed = response.statusCode === 200;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Response has user info
 */
async function test_has_user_info(response) {
    const testName = 'Response has user info (email, name)';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const user = response.body?.data?.user;
    const passed = user && typeof user.email === 'string' && typeof user.name === 'string';
    printTestResult(testName, passed, `Email: ${user?.email}, Name: ${user?.name}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response has credits
 */
async function test_has_credits(response) {
    const testName = 'Response has credits info';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const credits = response.body?.data?.credits;
    const passed = credits && typeof credits.credits_balance === 'number';
    printTestResult(testName, passed, `Balance: ${credits?.credits_balance}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response has recent transactions
 */
async function test_has_recent_transactions(response) {
    const testName = 'Response has recent_transactions array';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const passed = Array.isArray(response.body?.data?.recent_transactions);
    printTestResult(testName, passed, `Is array: ${passed}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Non-existent user
 */
async function test_nonexistent_user(hasAdmin) {
    const testName = 'GET /admin/credits/user/999999 → 404';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/user/999999`, null, authHeader('admin'));
    const passed = response.statusCode === 404;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('ADMIN USER CREDITS API TESTS');

    console.log('Setting up test users...\n');
    const { hasAdmin, userId } = await setupTestUsers();
    console.log(hasAdmin ? '✅ Admin ready' : '⚠️ Admin not available');
    console.log(userId ? `✅ Test user ID: ${userId}\n` : '⚠️ No test user\n');

    await test_without_auth();
    await test_with_non_admin();
    const response = await test_with_admin(hasAdmin, userId);
    await test_has_user_info(response);
    await test_has_credits(response);
    await test_has_recent_transactions(response);
    await test_nonexistent_user(hasAdmin);

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
