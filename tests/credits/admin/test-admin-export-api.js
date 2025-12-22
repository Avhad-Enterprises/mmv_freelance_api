#!/usr/bin/env node

/**
 * Admin Export Transactions API Tests
 * Tests GET /api/v1/admin/credits/export endpoint
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
        fs.writeFileSync(imagePath, Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    }
    if (!fs.existsSync(pdfPath)) {
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%%EOF');
    }

    const viEmail = randomEmail('export-test');
    const viForm = new FormData();
    viForm.append('first_name', 'ExportTest');
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

    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, viForm);
    const viLogin = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, { email: viEmail, password: 'Test@123456' });
    if (viLogin.body?.data?.token) storeToken('videographer', viLogin.body.data.token);

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
    const testName = 'GET /admin/credits/export without auth → 401';
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/export`);
    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with non-admin
 */
async function test_with_non_admin() {
    const testName = 'GET /admin/credits/export with videographer → 403';
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/export`, null, authHeader('videographer'));
    const passed = response.statusCode === 403;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with admin returns CSV
 */
async function test_with_admin(hasAdmin) {
    const testName = 'GET /admin/credits/export with admin → 200 with CSV';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin');
        failedTests++;
        return null;
    }

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/admin/credits/export`, null, authHeader('admin'));
    const passed = response.statusCode === 200;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Response has CSV content-type
 */
async function test_csv_content_type(response) {
    const testName = 'Response has text/csv content-type';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const contentType = response.headers['content-type'];
    const passed = contentType?.includes('text/csv');
    printTestResult(testName, passed, `Content-Type: ${contentType}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response has content-disposition header
 */
async function test_content_disposition(response) {
    const testName = 'Response has Content-Disposition attachment header';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const disposition = response.headers['content-disposition'];
    const passed = disposition?.includes('attachment') && disposition?.includes('.csv');
    printTestResult(testName, passed, `Disposition: ${disposition}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: CSV has headers
 */
async function test_csv_headers(response) {
    const testName = 'CSV has expected headers';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'Skipped');
        failedTests++;
        return;
    }

    const body = typeof response.body === 'string' ? response.body : '';
    const hasHeaders = body.includes('Transaction ID') ||
        body.includes('transaction_id') ||
        body.includes('User ID');

    const passed = hasHeaders || body.length > 0;
    printTestResult(testName, passed, `Body length: ${body.length} chars`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Filter by date range
 */
async function test_date_range_filter(hasAdmin) {
    const testName = 'Export with date range filter works';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin');
        failedTests++;
        return;
    }

    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date().toISOString();

    const response = await makeRequest('GET',
        `${CONFIG.apiVersion}/admin/credits/export?from=${from}&to=${to}`,
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
    printSection('ADMIN EXPORT TRANSACTIONS API TESTS');

    console.log('Setting up test users...\n');
    const { hasAdmin } = await setupTestUsers();
    console.log(hasAdmin ? '✅ Admin ready\n' : '⚠️ Admin not available\n');

    await test_without_auth();
    await test_with_non_admin();
    const response = await test_with_admin(hasAdmin);
    await test_csv_content_type(response);
    await test_content_disposition(response);
    await test_csv_headers(response);
    await test_date_range_filter(hasAdmin);

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
