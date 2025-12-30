#!/usr/bin/env node

/**
 * Admin Credits Transactions API Tests
 * Tests GET /api/v1/admin/credits/transactions endpoint
 * Note: Requires admin user to be set up
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

    // Setup Videographer (for non-admin tests)
    const viEmail = randomEmail('admin-tx-vi');
    const viForm = new FormData();
    viForm.append('first_name', 'AdminTxTest');
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

    // Try to login as admin (assumes admin exists)
    const adminLogin = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email: 'admin@mmvfreelance.com',
        password: 'Admin@123456'
    });
    if (adminLogin.body?.data?.token) {
        storeToken('admin', adminLogin.body.data.token);
        return { hasAdmin: true, hasVideographer: !!viLogin.body?.data?.token };
    } else {
        const debugLog = `Admin Login Failed: ${adminLogin.statusCode} ${JSON.stringify(adminLogin.body)}`;
        fs.writeFileSync('admin-debug.log', debugLog);
        console.log(debugLog);
    }

    return { hasAdmin: false, hasVideographer: !!viLogin.body?.data?.token };
}

/**
 * Test: GET without auth
 */
async function test_without_auth() {
    const testName = 'GET /admin/credits/transactions without auth → 401';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/transactions`);
    const passed = response.statusCode === 401;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with non-admin role
 */
async function test_with_non_admin_role() {
    const testName = 'GET /admin/credits/transactions with videographer → 403';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/transactions`, null, authHeader('videographer'));
    const passed = response.statusCode === 403;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with admin role
 */
async function test_with_admin_role(hasAdmin) {
    const testName = 'GET /admin/credits/transactions with admin → 200';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin user available');
        failedTests++;
        return null;
    }

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/transactions`, null, authHeader('admin'));
    const passed = response.statusCode === 200 && response.body?.success === true;

    if (!passed) {
        const debugLog = `Admin Tx Test Failed: ${response.statusCode} ${JSON.stringify(response.body)}`;
        fs.writeFileSync('admin-test-debug.log', debugLog);
    }

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Response structure
 */
async function test_response_structure(response) {
    const testName = 'Response has transactions and pagination';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped: No valid response');
        failedTests++;
        return;
    }

    const data = response.body?.data;
    const hasTransactions = Array.isArray(data?.transactions);
    const hasPagination = data?.pagination &&
        typeof data.pagination.total === 'number' &&
        typeof data.pagination.page === 'number';

    const passed = hasTransactions && hasPagination;
    printTestResult(testName, passed, `Transactions: ${hasTransactions}, Pagination: ${hasPagination}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Pagination works
 */
async function test_pagination(hasAdmin) {
    const testName = 'Pagination parameters work (page=1, limit=10)';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin user');
        failedTests++;
        return;
    }

    const response = await makeRequest('GET',
        `${CONFIG.apiVersion}/admin/credits/transactions?page=1&limit=10`,
        null,
        authHeader('admin')
    );

    const passed = response.statusCode === 200 &&
        response.body?.data?.pagination?.page === 1 &&
        response.body?.data?.pagination?.limit === 10;

    printTestResult(testName, passed,
        `Page: ${response.body?.data?.pagination?.page}, Limit: ${response.body?.data?.pagination?.limit}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Type filter
 */
async function test_type_filter(hasAdmin) {
    const testName = 'Type filter parameter works';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin user');
        failedTests++;
        return;
    }

    const response = await makeRequest('GET',
        `${CONFIG.apiVersion}/admin/credits/transactions?type=purchase`,
        null,
        authHeader('admin')
    );

    const passed = response.statusCode === 200;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('ADMIN CREDITS TRANSACTIONS API TESTS');

    console.log('Setting up test users...\n');
    const { hasAdmin, hasVideographer } = await setupTestUsers();

    if (!hasVideographer) {
        console.log('❌ Failed to setup videographer. Aborting tests.');
        process.exit(1);
    }
    console.log('✅ Videographer ready');
    console.log(hasAdmin ? '✅ Admin ready\n' : '⚠️ Admin not available (some tests will skip)\n');

    // Run tests
    await test_without_auth();
    await test_with_non_admin_role();
    const response = await test_with_admin_role(hasAdmin);
    await test_response_structure(response);
    await test_pagination(hasAdmin);
    await test_type_filter(hasAdmin);

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
