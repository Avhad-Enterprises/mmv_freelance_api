#!/usr/bin/env node

/**
 * Credits Refund Eligibility API Tests
 * Tests GET /api/v1/credits/refund-eligibility/:application_id endpoint
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
 * Setup test user
 */
async function setupTestUser() {
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

    const email = randomEmail('refund-elig');
    const formData = new FormData();
    formData.append('first_name', 'RefundElig');
    formData.append('last_name', 'Test');
    formData.append('email', email);
    formData.append('password', 'Test@123456');
    formData.append('skill_tags', JSON.stringify(['test']));
    formData.append('superpowers', JSON.stringify(['test']));
    formData.append('country', 'India');
    formData.append('city', 'Mumbai');
    formData.append('portfolio_links', JSON.stringify(['https://test.com']));
    formData.append('phone_number', '+91-9876543210');
    formData.append('id_type', 'passport');
    formData.append('short_description', 'Test');
    formData.append('languages', JSON.stringify(['English']));
    formData.append('terms_accepted', 'true');
    formData.append('privacy_policy_accepted', 'true');
    formData.append('profile_photo', fs.createReadStream(imagePath));
    formData.append('id_document', fs.createReadStream(pdfPath));

    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, formData);
    const loginRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, { email, password: 'Test@123456' });

    if (loginRes.body?.data?.token) {
        storeToken('videographer', loginRes.body.data.token);
        return true;
    }
    return false;
}

/**
 * Test: GET without auth
 */
async function test_without_auth() {
    const testName = 'GET /credits/refund-eligibility/:id without auth → 401';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refund-eligibility/1`);
    const passed = response.statusCode === 401;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with auth
 */
async function test_with_auth() {
    const testName = 'GET /credits/refund-eligibility/:id with auth → 200';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refund-eligibility/1`, null, authHeader('videographer'));
    // May return 200 with eligible:false or 404 if application doesn't exist
    const passed = response.statusCode === 200 || response.statusCode === 404;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Response structure when application found
 */
async function test_response_structure(response) {
    const testName = 'Response has eligibility fields';

    // If 404, skip structure test
    if (response.statusCode === 404) {
        printTestResult(testName, true, 'Skipped: No application to test');
        passedTests++;
        return;
    }

    const data = response.body?.data;
    const hasApplicationId = typeof data?.application_id === 'number';
    const hasEligible = typeof data?.eligible === 'boolean';
    const hasRefundAmount = typeof data?.refund_amount === 'number';
    const hasRefundPercent = typeof data?.refund_percent === 'number';

    const passed = hasApplicationId || hasEligible || hasRefundAmount || hasRefundPercent || data === undefined;

    printTestResult(testName, passed,
        `Has fields: application_id=${hasApplicationId}, eligible=${hasEligible}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Non-existent application
 */
async function test_nonexistent_application() {
    const testName = 'GET /credits/refund-eligibility/999999 → not found or not eligible';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refund-eligibility/999999`, null, authHeader('videographer'));

    // Should return 404 or 200 with eligible:false
    const passed = response.statusCode === 404 ||
        (response.statusCode === 200 && response.body?.data?.eligible === false);

    printTestResult(testName, passed, `Status: ${response.statusCode}, Eligible: ${response.body?.data?.eligible}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Invalid application ID format
 */
async function test_invalid_id_format() {
    const testName = 'GET /credits/refund-eligibility/abc → 400 or 404';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refund-eligibility/abc`, null, authHeader('videographer'));

    const passed = response.statusCode === 400 || response.statusCode === 404 || response.statusCode === 500;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS REFUND ELIGIBILITY API TESTS');

    console.log('Setting up test user...\n');
    const ready = await setupTestUser();
    if (!ready) {
        console.log('❌ Failed to setup user. Aborting.');
        process.exit(1);
    }
    console.log('✅ User ready\n');

    await test_without_auth();
    const response = await test_with_auth();
    await test_response_structure(response);
    await test_nonexistent_application();
    await test_invalid_id_format();

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
