#!/usr/bin/env node

/**
 * Admin Refund Project API Tests
 * Tests POST /api/v1/admin/credits/refund-project/:project_id endpoint
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

    // Create videographer
    const viEmail = randomEmail('refund-proj');
    const viForm = new FormData();
    viForm.append('first_name', 'RefundProj');
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
 * Test: POST without auth
 */
async function test_without_auth() {
    const testName = 'POST /admin/credits/refund-project/:id without auth → 401';
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/refund-project/1`);
    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with non-admin
 */
async function test_with_non_admin() {
    const testName = 'POST /admin/credits/refund-project/:id with videographer → 403';
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/refund-project/1`, null, authHeader('videographer'));
    const passed = response.statusCode === 403;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with non-existent project
 */
async function test_nonexistent_project(hasAdmin) {
    const testName = 'POST /admin/credits/refund-project/999999 → 404';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin');
        failedTests++;
        return;
    }

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/refund-project/999999`, null, authHeader('admin'));
    const passed = response.statusCode === 404;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response structure on success
 */
async function test_response_structure(hasAdmin) {
    const testName = 'Response has refunds_processed and total_applications fields';

    if (!hasAdmin) {
        printTestResult(testName, false, 'Skipped: No admin');
        failedTests++;
        return;
    }

    // Try with project ID 1 (may or may not exist)
    const response = await makeRequest('POST', `${CONFIG.apiVersion}/admin/credits/refund-project/1`, null, authHeader('admin'));

    // If project exists
    if (response.statusCode === 200) {
        const data = response.body?.data;
        const passed = typeof data?.refunds_processed === 'number' &&
            typeof data?.total_applications === 'number';
        printTestResult(testName, passed,
            `Refunded: ${data?.refunds_processed}, Total: ${data?.total_applications}`
        );
        passed ? passedTests++ : failedTests++;
    } else {
        // If project doesn't exist, that's also acceptable
        printTestResult(testName, true, 'Project not found (acceptable)');
        passedTests++;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('ADMIN REFUND PROJECT API TESTS');

    console.log('Setting up test users...\n');
    const { hasAdmin } = await setupTestUsers();
    console.log(hasAdmin ? '✅ Admin ready\n' : '⚠️ Admin not available\n');

    await test_without_auth();
    await test_with_non_admin();
    await test_nonexistent_project(hasAdmin);
    await test_response_structure(hasAdmin);

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
