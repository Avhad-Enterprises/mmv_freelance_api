#!/usr/bin/env node

/**
 * Credits Purchase Flow Integration Test
 * End-to-end test of the complete purchase flow
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

    const email = randomEmail('purchase-flow');
    const formData = new FormData();
    formData.append('first_name', 'PurchaseFlow');
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
 * STEP 1: Get initial balance (should be 0)
 */
async function step1_get_initial_balance() {
    const testName = 'STEP 1: Get initial balance → 0';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('videographer'));

    const passed = response.statusCode === 200 &&
        response.body?.data?.credits_balance === 0;

    printTestResult(testName, passed,
        `Balance: ${response.body?.data?.credits_balance}`
    );
    passed ? passedTests++ : failedTests++;
    return response.body?.data?.credits_balance || 0;
}

/**
 * STEP 2: Get available packages
 */
async function step2_get_packages() {
    const testName = 'STEP 2: Get available packages → 4 packages';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/packages`, null, authHeader('videographer'));

    const passed = response.statusCode === 200 &&
        response.body?.data?.packages?.length === 4;

    printTestResult(testName, passed,
        `Packages: ${response.body?.data?.packages?.map(p => p.name).join(', ')}`
    );
    passed ? passedTests++ : failedTests++;
    return response.body?.data?.packages || [];
}

/**
 * STEP 3: Select package and initiate purchase
 */
async function step3_initiate_purchase(packages) {
    const testName = 'STEP 3: Initiate purchase (Basic - 10 credits)';

    const basicPkg = packages.find(p => p.name === 'Basic');

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 10, package_id: basicPkg?.id || 2 },
        authHeader('videographer')
    );

    const passed = response.statusCode === 200 &&
        response.body?.data?.order_id?.startsWith('order_');

    printTestResult(testName, passed,
        `Order ID: ${response.body?.data?.order_id?.substring(0, 25)}...`
    );
    passed ? passedTests++ : failedTests++;
    return response.body?.data || null;
}

/**
 * STEP 4: Verify order details
 */
async function step4_verify_order_details(orderData) {
    const testName = 'STEP 4: Verify order details (amount, currency, key)';

    if (!orderData) {
        printTestResult(testName, false, 'No order data');
        failedTests++;
        return;
    }

    const passed = orderData.amount === 50000 && // 10 × 50 × 100 paise
        orderData.currency === 'INR' &&
        orderData.credits === 10 &&
        typeof orderData.key_id === 'string';

    printTestResult(testName, passed,
        `Amount: ${orderData.amount} paise, Credits: ${orderData.credits}, Has Key: ${!!orderData.key_id}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * STEP 5: Balance unchanged (payment not completed)
 */
async function step5_balance_unchanged() {
    const testName = 'STEP 5: Balance still 0 (payment not completed)';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('videographer'));

    const passed = response.statusCode === 200 &&
        response.body?.data?.credits_balance === 0;

    printTestResult(testName, passed,
        `Balance: ${response.body?.data?.credits_balance} (unchanged until payment)`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * STEP 6: History is empty (no completed transactions)
 */
async function step6_history_empty() {
    const testName = 'STEP 6: Transaction history empty';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/history`, null, authHeader('videographer'));

    const passed = response.statusCode === 200 &&
        response.body?.data?.transactions?.length === 0;

    printTestResult(testName, passed,
        `Transactions: ${response.body?.data?.transactions?.length}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * STEP 7: Multiple orders can be created
 */
async function step7_multiple_orders() {
    const testName = 'STEP 7: Can create multiple orders';

    const response1 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 5 },
        authHeader('videographer')
    );

    const response2 = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 25, package_id: 3 },
        authHeader('videographer')
    );

    const passed = response1.body?.data?.order_id !== response2.body?.data?.order_id &&
        response1.statusCode === 200 &&
        response2.statusCode === 200;

    printTestResult(testName, passed,
        `Order 1: ${response1.body?.data?.order_id?.substring(0, 15)}, Order 2: ${response2.body?.data?.order_id?.substring(0, 15)}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS PURCHASE FLOW INTEGRATION TEST');

    console.log('This test simulates the complete purchase flow:\n');
    console.log('1. New user registers and logs in');
    console.log('2. Checks initial balance (0)');
    console.log('3. Views available packages');
    console.log('4. Initiates purchase (creates Razorpay order)');
    console.log('5. Verifies order details');
    console.log('6. Confirms balance unchanged (payment pending)');
    console.log('7. History is empty (no completed transactions)\n');

    console.log('Setting up test user...\n');
    const ready = await setupTestUser();
    if (!ready) {
        console.log('❌ Failed to setup user. Aborting.');
        process.exit(1);
    }
    console.log('✅ User ready\n');

    // Run flow steps
    const initialBalance = await step1_get_initial_balance();
    const packages = await step2_get_packages();
    const orderData = await step3_initiate_purchase(packages);
    await step4_verify_order_details(orderData);
    await step5_balance_unchanged();
    await step6_history_empty();
    await step7_multiple_orders();

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
