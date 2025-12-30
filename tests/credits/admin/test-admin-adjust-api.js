#!/usr/bin/env node

/**
 * Admin Credits Adjust API Tests
 * Tests POST /api/v1/admin/credits/adjust endpoint
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

    // Create videographer to adjust credits for
    const viEmail = randomEmail('adjust-target');
    const viForm = new FormData();
    viForm.append('first_name', 'AdjustTarget');
    viForm.append('last_name', 'User');
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

    const regRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, viForm);

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
 * Test: POST without auth
 */
async function test_without_auth() {
    const testName = 'POST /admin/credits/adjust without auth → 401';
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`, {
        user_id: 1, amount: 10, reason: 'Test adjustment'
    });
    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with non-admin
 */
async function test_with_non_admin() {
    const testName = 'POST /admin/credits/adjust with videographer → 403';
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`,
        { user_id: 1, amount: 10, reason: 'Test adjustment' },
        authHeader('videographer')
    );
    const passed = response.statusCode === 403;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST add credits
 */
async function test_add_credits(hasAdmin, userId) {
    const testName = 'POST add 10 credits to user → balance increased';

    if (!hasAdmin || !userId) {
        printTestResult(testName, false, 'Skipped: No admin or user');
        failedTests++;
        return;
    }

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`,
        { user_id: userId, amount: 10, reason: 'Test adding credits for testing purposes' },
        authHeader('admin')
    );

    const passed = response.statusCode === 200 &&
        response.body?.data?.newBalance === 10 &&
        response.body?.data?.adjustment === 10;

    printTestResult(testName, passed,
        `New Balance: ${response.body?.data?.newBalance}, Adjustment: ${response.body?.data?.adjustment}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST deduct credits
 */
async function test_deduct_credits(hasAdmin, userId) {
    const testName = 'POST deduct 5 credits from user → balance decreased';

    if (!hasAdmin || !userId) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`,
        { user_id: userId, amount: -5, reason: 'Test deducting credits for testing purposes' },
        authHeader('admin')
    );

    const passed = response.statusCode === 200 &&
        response.body?.data?.newBalance === 5 &&
        response.body?.data?.adjustment === -5;

    printTestResult(testName, passed,
        `New Balance: ${response.body?.data?.newBalance}, Adjustment: ${response.body?.data?.adjustment}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Missing reason validation
 */
async function test_missing_reason(hasAdmin, userId) {
    const testName = 'POST without reason → 400 validation error';

    if (!hasAdmin || !userId) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`,
        { user_id: userId, amount: 5 },
        authHeader('admin')
    );

    const passed = response.statusCode === 400;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Short reason validation
 */
async function test_short_reason(hasAdmin, userId) {
    const testName = 'POST with reason < 10 chars → 400 validation error';

    if (!hasAdmin || !userId) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`,
        { user_id: userId, amount: 5, reason: 'Short' },
        authHeader('admin')
    );

    const passed = response.statusCode === 400;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Deduct more than balance
 */
async function test_deduct_more_than_balance(hasAdmin, userId) {
    const testName = 'POST deduct 100 credits (more than balance) → 400 error';

    if (!hasAdmin || !userId) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`,
        { user_id: userId, amount: -100, reason: 'Test deducting more than balance' },
        authHeader('admin')
    );

    const passed = response.statusCode === 400;
    printTestResult(testName, passed, `Status: ${response.statusCode}, Message: ${response.body?.message?.substring(0, 40)}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Zero amount
 */
async function test_zero_amount(hasAdmin, userId) {
    const testName = 'POST with amount=0 → 400 validation error';

    if (!hasAdmin || !userId) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/adjust`,
        { user_id: userId, amount: 0, reason: 'Test zero adjustment reason' },
        authHeader('admin')
    );

    const passed = response.statusCode === 400;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('ADMIN CREDITS ADJUST API TESTS');

    console.log('Setting up test users...\n');
    const { hasAdmin, userId } = await setupTestUsers();
    console.log(hasAdmin ? '✅ Admin ready' : '⚠️ Admin not available');
    console.log(userId ? `✅ Test user ID: ${userId}\n` : '⚠️ No test user\n');

    await test_without_auth();
    await test_with_non_admin();
    await test_add_credits(hasAdmin, userId);
    await test_deduct_credits(hasAdmin, userId);
    await test_missing_reason(hasAdmin, userId);
    await test_short_reason(hasAdmin, userId);
    await test_deduct_more_than_balance(hasAdmin, userId);
    await test_zero_amount(hasAdmin, userId);

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
