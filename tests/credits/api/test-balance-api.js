#!/usr/bin/env node

/**
 * Credits Balance API Tests
 * Tests GET /api/v1/credits/balance endpoint
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

// Test user credentials
let testVideographerEmail;
let testClientEmail;

/**
 * Create test files for registration
 */
function ensureTestFilesExist() {
    const testDir = path.join(__dirname, '..', '..', 'auth', 'test-files');
    const imagePath = path.join(testDir, 'test-profile.png');
    const pdfPath = path.join(testDir, 'test-id.pdf');

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    // Create minimal PNG
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

    // Create minimal PDF
    if (!fs.existsSync(pdfPath)) {
        fs.writeFileSync(pdfPath, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n116\n%%EOF');
    }

    return { imagePath, pdfPath };
}

/**
 * Register and login as videographer
 */
async function setupVideographer() {
    const { imagePath, pdfPath } = ensureTestFilesExist();
    testVideographerEmail = randomEmail('credits-balance-vi');

    const formData = new FormData();
    formData.append('first_name', 'CreditsTest');
    formData.append('last_name', 'Videographer');
    formData.append('email', testVideographerEmail);
    formData.append('password', 'Test@123456');
    formData.append('skill_tags', JSON.stringify(['cinematography']));
    formData.append('superpowers', JSON.stringify(['editing']));
    formData.append('country', 'India');
    formData.append('city', 'Mumbai');
    formData.append('portfolio_links', JSON.stringify(['https://portfolio.test']));
    formData.append('phone_number', '+91-9876543210');
    formData.append('id_type', 'passport');
    formData.append('short_description', 'Test videographer for credits testing');
    formData.append('languages', JSON.stringify(['English', 'Hindi']));
    formData.append('terms_accepted', 'true');
    formData.append('privacy_policy_accepted', 'true');
    formData.append('profile_photo', fs.createReadStream(imagePath), { filename: 'profile.png', contentType: 'image/png' });
    formData.append('id_document', fs.createReadStream(pdfPath), { filename: 'id.pdf', contentType: 'application/pdf' });

    const registerRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, formData);

    if (registerRes.statusCode !== 201) {
        console.log('Failed to register videographer:', registerRes.body?.message || registerRes.statusCode);
        return false;
    }

    // Login
    const loginRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email: testVideographerEmail,
        password: 'Test@123456'
    });

    if (loginRes.statusCode === 200 && loginRes.body?.data?.token) {
        storeToken('videographer', loginRes.body.data.token);
        return true;
    }

    return false;
}

/**
 * Register and login as client
 */
async function setupClient() {
    testClientEmail = randomEmail('credits-balance-cl');

    const registerRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/client`, {
        first_name: 'CreditsTest',
        last_name: 'Client',
        email: testClientEmail,
        password: 'Test@123456',
        company_name: 'Test Corp',
        company_size: '1-10',
        industry: 'corporate',
        phone_number: '+91-9876543211',
        country: 'India',
        city: 'Delhi',
        terms_accepted: true,
        privacy_policy_accepted: true
    });

    if (registerRes.statusCode !== 201) {
        console.log('Failed to register client:', registerRes.body?.message || registerRes.statusCode);
        return false;
    }

    // Login
    const loginRes = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
        email: testClientEmail,
        password: 'Test@123456'
    });

    if (loginRes.statusCode === 200 && loginRes.body?.data?.token) {
        storeToken('client', loginRes.body.data.token);
        return true;
    }

    return false;
}

/**
 * Test: GET without authentication
 */
async function test_GET_without_auth() {
    const testName = 'GET /credits/balance without auth → 401';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`);
    const passed = response.statusCode === 401;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with client role (should be forbidden)
 */
async function test_GET_with_client_role() {
    const testName = 'GET /credits/balance with client role → 403';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('client'));
    const passed = response.statusCode === 403;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: GET with videographer role (should succeed)
 */
async function test_GET_with_videographer_role() {
    const testName = 'GET /credits/balance with videographer role → 200';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('videographer'));
    const passed = response.statusCode === 200 && response.body?.success === true;

    printTestResult(testName, passed, `Status: ${response.statusCode}, Success: ${response.body?.success}`);
    passed ? passedTests++ : failedTests++;

    return response;
}

/**
 * Test: Verify response structure
 */
async function test_response_structure(balanceResponse) {
    const testName = 'Balance response has required fields';

    if (!balanceResponse || balanceResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid balance response');
        failedTests++;
        return;
    }

    const data = balanceResponse.body?.data;
    const hasCreditsBalance = typeof data?.credits_balance === 'number';
    const hasTotalPurchased = typeof data?.total_credits_purchased === 'number';
    const hasCreditsUsed = typeof data?.credits_used === 'number';
    const hasPricePerCredit = typeof data?.pricePerCredit === 'number';
    const hasCurrency = typeof data?.currency === 'string';

    const passed = hasCreditsBalance && hasTotalPurchased && hasCreditsUsed && hasPricePerCredit && hasCurrency;

    printTestResult(testName, passed,
        `credits_balance: ${hasCreditsBalance}, total_purchased: ${hasTotalPurchased}, ` +
        `credits_used: ${hasCreditsUsed}, pricePerCredit: ${hasPricePerCredit}, currency: ${hasCurrency}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Verify balance logic (new user should have 0)
 */
async function test_new_user_balance_zero(balanceResponse) {
    const testName = 'New user has 0 credits balance';

    if (!balanceResponse || balanceResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid balance response');
        failedTests++;
        return;
    }

    const data = balanceResponse.body?.data;
    const passed = data?.credits_balance === 0 && data?.total_credits_purchased === 0 && data?.credits_used === 0;

    printTestResult(testName, passed,
        `Balance: ${data?.credits_balance}, Purchased: ${data?.total_credits_purchased}, Used: ${data?.credits_used}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Verify pricing info
 */
async function test_pricing_info(balanceResponse) {
    const testName = 'Balance includes correct pricing info (₹50/credit)';

    if (!balanceResponse || balanceResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid balance response');
        failedTests++;
        return;
    }

    const data = balanceResponse.body?.data;
    const passed = data?.pricePerCredit === 50 && data?.currency === 'INR';

    printTestResult(testName, passed, `Price: ₹${data?.pricePerCredit}, Currency: ${data?.currency}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS BALANCE API TESTS');

    // Setup test users
    console.log('Setting up test users...\n');

    const videographerReady = await setupVideographer();
    if (!videographerReady) {
        console.log('❌ Failed to setup videographer. Aborting tests.');
        process.exit(1);
    }
    console.log('✅ Videographer ready\n');

    const clientReady = await setupClient();
    if (!clientReady) {
        console.log('❌ Failed to setup client. Aborting tests.');
        process.exit(1);
    }
    console.log('✅ Client ready\n');

    // Run tests
    await test_GET_without_auth();
    await test_GET_with_client_role();
    const balanceResponse = await test_GET_with_videographer_role();
    await test_response_structure(balanceResponse);
    await test_new_user_balance_zero(balanceResponse);
    await test_pricing_info(balanceResponse);

    // Summary
    printSummary(passedTests, failedTests);

    return { passed: passedTests, failed: failedTests };
}

// Run if called directly
if (require.main === module) {
    runTests()
        .then(({ failed }) => process.exit(failed > 0 ? 1 : 0))
        .catch(err => {
            console.error('Test runner failed:', err);
            process.exit(1);
        });
}

module.exports = { runTests };
