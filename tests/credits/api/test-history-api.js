#!/usr/bin/env node

/**
 * Credits History API Tests
 * Tests GET /api/v1/credits/history endpoint
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
 * Setup test videographer
 */
async function setupVideographer() {
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

    const email = randomEmail('credits-history');
    const formData = new FormData();
    formData.append('first_name', 'HistoryTest');
    formData.append('last_name', 'User');
    formData.append('email', email);
    formData.append('password', 'Test@123456');
    formData.append('skill_tags', JSON.stringify(['cinematography']));
    formData.append('superpowers', JSON.stringify(['editing']));
    formData.append('country', 'India');
    formData.append('city', 'Mumbai');
    formData.append('portfolio_links', JSON.stringify(['https://test.com']));
    formData.append('phone_number', '+91-9876543210');
    formData.append('id_type', 'passport');
    formData.append('short_description', 'Test user');
    formData.append('languages', JSON.stringify(['English']));
    formData.append('terms_accepted', 'true');
    formData.append('privacy_policy_accepted', 'true');
    formData.append('profile_photo', fs.createReadStream(imagePath));
    formData.append('id_document', fs.createReadStream(pdfPath));

    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, formData);

    const loginRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email,
        password: 'Test@123456'
    });

    if (loginRes.statusCode === 200 && loginRes.body?.data?.token) {
        storeToken('videographer', loginRes.body.data.token);
        return true;
    }
    return false;
}

/**
 * Test: GET history without auth
 */
async function test_without_auth() {
    const testName = 'GET /credits/history without auth → 401';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/history`);
    const passed = response.statusCode === 401;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET history with auth
 */
async function test_with_auth() {
    const testName = 'GET /credits/history with auth → 200';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/history`, null, authHeader('videographer'));
    const passed = response.statusCode === 200 && response.body?.success === true;

    printTestResult(testName, passed, `Status: ${response.statusCode}, Success: ${response.body?.success}`);
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Response has correct structure
 */
async function test_response_structure(historyResponse) {
    const testName = 'History response has transactions array and pagination';

    if (!historyResponse || historyResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid history response');
        failedTests++;
        return;
    }

    const data = historyResponse.body?.data;
    const hasTransactions = Array.isArray(data?.transactions);
    const hasPagination = data?.pagination &&
        typeof data.pagination.total === 'number' &&
        typeof data.pagination.page === 'number' &&
        typeof data.pagination.limit === 'number' &&
        typeof data.pagination.totalPages === 'number';

    const passed = hasTransactions && hasPagination;

    printTestResult(testName, passed,
        `Has transactions: ${hasTransactions}, Has pagination: ${hasPagination}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: New user has empty history
 */
async function test_new_user_empty_history(historyResponse) {
    const testName = 'New user has empty transaction history';

    if (!historyResponse || historyResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid history response');
        failedTests++;
        return;
    }

    const transactions = historyResponse.body?.data?.transactions || [];
    const total = historyResponse.body?.data?.pagination?.total || 0;
    const passed = transactions.length === 0 && total === 0;

    printTestResult(testName, passed,
        `Transactions: ${transactions.length}, Total: ${total}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Pagination parameters work
 */
async function test_pagination_params() {
    const testName = 'Pagination parameters (page, limit) work';

    const response = await makeRequest(
        'GET',
        `${CONFIG.apiVersion}/credits/history?page=1&limit=5`,
        null,
        authHeader('videographer')
    );

    const passed = response.statusCode === 200 &&
        response.body?.data?.pagination?.page === 1 &&
        response.body?.data?.pagination?.limit === 5;

    printTestResult(testName, passed,
        `Page: ${response.body?.data?.pagination?.page}, Limit: ${response.body?.data?.pagination?.limit}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Type filter parameter
 */
async function test_type_filter() {
    const testName = 'Type filter parameter accepted';

    const response = await makeRequest(
        'GET',
        `${CONFIG.apiVersion}/credits/history?type=purchase`,
        null,
        authHeader('videographer')
    );

    // Should return 200 even if no transactions match
    const passed = response.statusCode === 200;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Max limit is enforced (50)
 */
async function test_max_limit_enforced() {
    const testName = 'Max limit of 50 is enforced';

    const response = await makeRequest(
        'GET',
        `${CONFIG.apiVersion}/credits/history?limit=100`,
        null,
        authHeader('videographer')
    );

    // Even if requested 100, should return max 50
    const passed = response.statusCode === 200 && response.body?.data?.pagination?.limit <= 50;

    printTestResult(testName, passed,
        `Requested: 100, Got: ${response.body?.data?.pagination?.limit}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS HISTORY API TESTS');

    console.log('Setting up test user...\n');
    const ready = await setupVideographer();
    if (!ready) {
        console.log('❌ Failed to setup user. Aborting tests.');
        process.exit(1);
    }
    console.log('✅ User ready\n');

    // Run tests
    await test_without_auth();
    const historyResponse = await test_with_auth();
    await test_response_structure(historyResponse);
    await test_new_user_empty_history(historyResponse);
    await test_pagination_params();
    await test_type_filter();
    await test_max_limit_enforced();

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
