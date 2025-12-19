#!/usr/bin/env node

/**
 * Credits Refunds History API Tests
 * Tests GET /api/v1/credits/refunds endpoint
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

    const email = randomEmail('refunds-hist');
    const formData = new FormData();
    formData.append('first_name', 'RefundHist');
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
    const testName = 'GET /credits/refunds without auth → 401';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refunds`);
    const passed = response.statusCode === 401;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with auth
 */
async function test_with_auth() {
    const testName = 'GET /credits/refunds with auth → 200';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refunds`, null, authHeader('videographer'));
    const passed = response.statusCode === 200 && response.body?.success === true;

    printTestResult(testName, passed, `Status: ${response.statusCode}, Success: ${response.body?.success}`);
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Response is array
 */
async function test_response_is_array(response) {
    const testName = 'Response data is array';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'No valid response');
        failedTests++;
        return;
    }

    const passed = Array.isArray(response.body?.data);
    printTestResult(testName, passed, `Is array: ${passed}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: New user has empty refunds
 */
async function test_new_user_empty_refunds(response) {
    const testName = 'New user has empty refunds array';

    if (!response || response.statusCode !== 200) {
        printTestResult(testName, false, 'No valid response');
        failedTests++;
        return;
    }

    const passed = Array.isArray(response.body?.data) && response.body.data.length === 0;
    printTestResult(testName, passed, `Refunds: ${response.body?.data?.length || 0}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS REFUNDS HISTORY API TESTS');

    console.log('Setting up test user...\n');
    const ready = await setupTestUser();
    if (!ready) {
        console.log('❌ Failed to setup user. Aborting.');
        process.exit(1);
    }
    console.log('✅ User ready\n');

    await test_without_auth();
    const response = await test_with_auth();
    await test_response_is_array(response);
    await test_new_user_empty_refunds(response);

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
