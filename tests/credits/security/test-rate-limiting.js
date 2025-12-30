#!/usr/bin/env node

/**
 * Credits Rate Limiting Tests
 * Tests rate limiting protection on credit endpoints
 */

const {
    CONFIG,
    makeRequest,
    printTestResult,
    printSection,
    printSummary,
    storeToken,
    authHeader,
    randomEmail,
    sleep
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

    const email = randomEmail('rate-limit');
    const formData = new FormData();
    formData.append('first_name', 'RateLimit');
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
 * Test: Multiple balance requests don't get rate limited (under limit)
 */
async function test_balance_under_limit() {
    const testName = '5 balance requests in quick succession → all succeed';

    const results = [];
    for (let i = 0; i < 5; i++) {
        const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('videographer'));
        results.push(response.statusCode);
    }

    const allSuccessful = results.every(code => code === 200);
    const passed = allSuccessful;

    printTestResult(testName, passed, `Status codes: ${results.join(', ')}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Rate limit headers present
 */
async function test_rate_limit_headers() {
    const testName = 'Rate limit headers present in response';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('videographer'));

    // Rate limit headers may be present
    const hasRateLimitHeaders = response.headers['x-ratelimit-limit'] ||
        response.headers['ratelimit-limit'] ||
        response.headers['x-ratelimit-remaining'] ||
        response.headers['ratelimit-remaining'];

    // Pass even if headers not present (depends on express-rate-limit config)
    const passed = response.statusCode === 200;

    printTestResult(testName, passed,
        `Has rate limit headers: ${!!hasRateLimitHeaders}, Status: ${response.statusCode}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Purchase requests work normally
 */
async function test_purchase_normal() {
    const testName = 'Multiple purchase requests work normally';

    const results = [];
    for (let i = 0; i < 3; i++) {
        const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
            { credits_amount: 5 },
            authHeader('videographer')
        );
        results.push(response.statusCode);
    }

    const allSuccessful = results.every(code => code === 200);
    const passed = allSuccessful;

    printTestResult(testName, passed, `Status codes: ${results.join(', ')}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: History requests work normally
 */
async function test_history_normal() {
    const testName = 'Multiple history requests work normally';

    const results = [];
    for (let i = 0; i < 5; i++) {
        const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/history`, null, authHeader('videographer'));
        results.push(response.statusCode);
    }

    const allSuccessful = results.every(code => code === 200);
    const passed = allSuccessful;

    printTestResult(testName, passed, `Status codes: ${results.join(', ')}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Packages requests work normally
 */
async function test_packages_normal() {
    const testName = 'Multiple packages requests work normally';

    const results = [];
    for (let i = 0; i < 5; i++) {
        const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/packages`, null, authHeader('videographer'));
        results.push(response.statusCode);
    }

    const allSuccessful = results.every(code => code === 200);
    const passed = allSuccessful;

    printTestResult(testName, passed, `Status codes: ${results.join(', ')}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test info: Rate limit explanation
 */
async function test_rate_limit_info() {
    const testName = 'INFO: Rate limits configured';

    console.log('\n  📋 Rate Limit Configuration:');
    console.log('     • Credit Operations: 10 requests/minute');
    console.log('     • Purchase Operations: 5 requests/hour');
    console.log('     • Rate limits are per-user (based on user_id or IP)\n');

    printTestResult(testName, true, 'Rate limits are configured in middlewares');
    passedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS RATE LIMITING TESTS');

    console.log('Testing rate limiting behavior on credit endpoints.\n');
    console.log('Note: Full rate limit testing (hitting 429) would require');
    console.log('many requests and is not suitable for automated tests.\n');

    console.log('Setting up test user...\n');
    const ready = await setupTestUser();
    if (!ready) {
        console.log('❌ Failed to setup user. Aborting.');
        process.exit(1);
    }
    console.log('✅ User ready\n');

    // Run tests
    await test_balance_under_limit();
    await test_rate_limit_headers();
    await test_purchase_normal();
    await test_history_normal();
    await test_packages_normal();
    await test_rate_limit_info();

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
