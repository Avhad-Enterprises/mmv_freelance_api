#!/usr/bin/env node

/**
 * Credits Initiate Purchase API Tests
 * Tests POST /api/v1/credits/initiate-purchase endpoint
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

    const email = randomEmail('credits-purchase');
    const formData = new FormData();
    formData.append('first_name', 'PurchaseTest');
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
 * Test: POST without auth
 */
async function test_without_auth() {
    const testName = 'POST /credits/initiate-purchase without auth → 401';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`, {
        credits_amount: 10
    });

    const passed = response.statusCode === 401;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with custom credits amount
 */
async function test_with_credits_amount() {
    const testName = 'POST with credits_amount creates Razorpay order';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 10 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 200 &&
        response.body?.success === true &&
        response.body?.data?.order_id?.startsWith('order_');

    printTestResult(testName, passed,
        `Status: ${response.statusCode}, Order ID: ${response.body?.data?.order_id?.substring(0, 20)}...`
    );
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Order amount is correct (credits × 50 × 100 paise)
 */
async function test_order_amount() {
    const testName = 'Order amount is correct (10 credits = ₹500 = 50000 paise)';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 10 },
        authHeader('videographer')
    );

    // Amount should be 10 × 50 × 100 = 50000 paise
    const expectedAmount = 10 * 50 * 100;
    const passed = response.body?.data?.amount === expectedAmount;

    if (!passed) {
        fs.writeFileSync('purchase-fail-amount.log', JSON.stringify({
            actual: response.body?.data?.amount,
            expected: expectedAmount,
            body: response.body
        }, null, 2));
    }

    printTestResult(testName, passed,
        `Amount: ${response.body?.data?.amount}, Expected: ${expectedAmount}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with package_id
 */
async function test_with_package_id() {
    const testName = 'POST with package_id=2 (Basic) creates order for 10 credits';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 10, package_id: 2 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 200 &&
        response.body?.data?.credits === 10 &&
        response.body?.data?.package_name === 'Basic';

    if (!passed) {
        fs.writeFileSync('purchase-fail-package.log', JSON.stringify({
            statusCode: response.statusCode,
            body: response.body
        }, null, 2));
    }

    printTestResult(testName, passed,
        `Credits: ${response.body?.data?.credits}, Package: ${response.body?.data?.package_name}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with invalid package_id
 */
async function test_invalid_package_id() {
    const testName = 'POST with invalid package_id → 400';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 10, package_id: 999 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 400;
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with amount exceeding max (>200)
 */
async function test_exceed_max_purchase() {
    const testName = 'POST with credits_amount > 200 → 400';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 250 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 400;

    if (!passed) {
        fs.writeFileSync('purchase-fail-max.log', `Status: ${response.statusCode} Body: ${JSON.stringify(response.body)}`);
    }

    printTestResult(testName, passed,
        `Status: ${response.statusCode}, Message: ${response.body?.message?.substring(0, 50) || 'N/A'}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: POST with amount below min (0)
 */
async function test_below_min_purchase() {
    const testName = 'POST with credits_amount = 0 → 400';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 0 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 400;
    if (!passed) {
        fs.writeFileSync('purchase-fail-min.log', `Status: ${response.statusCode} Body: ${JSON.stringify(response.body)}`);
    }
    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response includes Razorpay key_id
 */
async function test_includes_razorpay_key() {
    const testName = 'Response includes Razorpay key_id';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 5 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 200 &&
        typeof response.body?.data?.key_id === 'string' &&
        response.body?.data?.key_id.length > 0;

    if (!passed) {
        fs.writeFileSync('purchase-fail-key.log', JSON.stringify({
            status: response.statusCode,
            key: response.body?.data?.key_id,
            body: response.body
        }, null, 2));
    }

    printTestResult(testName, passed, `Has key_id: ${!!response.body?.data?.key_id}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Response includes user info
 */
async function test_includes_user_info() {
    const testName = 'Response includes user name and email';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 5 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 200 &&
        response.body?.data?.user?.name &&
        response.body?.data?.user?.email;

    if (!passed) {
        fs.writeFileSync('purchase-fail-user.log', JSON.stringify({
            status: response.statusCode,
            user: response.body?.data?.user,
            body: response.body
        }, null, 2));
    }

    printTestResult(testName, passed,
        `User: ${response.body?.data?.user?.name}, Email: ${response.body?.data?.user?.email}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS INITIATE PURCHASE API TESTS');

    console.log('Setting up test user...\n');
    const ready = await setupVideographer();
    if (!ready) {
        console.log('❌ Failed to setup user. Aborting tests.');
        process.exit(1);
    }
    console.log('✅ User ready\n');

    // Run tests
    await test_without_auth();
    await test_with_credits_amount();
    await test_order_amount();
    await test_with_package_id();
    await test_invalid_package_id();
    await test_exceed_max_purchase();
    await test_below_min_purchase();
    await test_includes_razorpay_key();
    await test_includes_user_info();

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
