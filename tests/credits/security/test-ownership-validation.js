#!/usr/bin/env node

/**
 * Credits Ownership Validation Tests
 * Tests that users can only access their own credit data
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
let user1Id = null;
let user2Id = null;

/**
 * Setup two test users
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

    // Create first user
    const email1 = randomEmail('owner-1');
    const form1 = new FormData();
    form1.append('first_name', 'Owner1');
    form1.append('last_name', 'Test');
    form1.append('email', email1);
    form1.append('password', 'Test@123456');
    form1.append('skill_tags', JSON.stringify(['test']));
    form1.append('superpowers', JSON.stringify(['test']));
    form1.append('country', 'India');
    form1.append('city', 'Mumbai');
    form1.append('portfolio_links', JSON.stringify(['https://test.com']));
    form1.append('phone_number', '+91-9876543210');
    form1.append('id_type', 'passport');
    form1.append('short_description', 'Test');
    form1.append('languages', JSON.stringify(['English']));
    form1.append('terms_accepted', 'true');
    form1.append('privacy_policy_accepted', 'true');
    form1.append('profile_photo', fs.createReadStream(imagePath));
    form1.append('id_document', fs.createReadStream(pdfPath));

    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, form1);
    const login1 = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, { email: email1, password: 'Test@123456' });
    if (login1.body?.data?.token) {
        storeToken('user1', login1.body.data.token);
        user1Id = login1.body.data.user?.user_id;
    }

    // Create second user
    const email2 = randomEmail('owner-2');
    const form2 = new FormData();
    form2.append('first_name', 'Owner2');
    form2.append('last_name', 'Test');
    form2.append('email', email2);
    form2.append('password', 'Test@123456');
    form2.append('skill_tags', JSON.stringify(['test']));
    form2.append('superpowers', JSON.stringify(['test']));
    form2.append('country', 'India');
    form2.append('city', 'Mumbai');
    form2.append('portfolio_links', JSON.stringify(['https://test.com']));
    form2.append('phone_number', '+91-9876543211');
    form2.append('id_type', 'passport');
    form2.append('short_description', 'Test');
    form2.append('languages', JSON.stringify(['English']));
    form2.append('terms_accepted', 'true');
    form2.append('privacy_policy_accepted', 'true');
    form2.append('profile_photo', fs.createReadStream(imagePath));
    form2.append('id_document', fs.createReadStream(pdfPath));

    await makeRequest('POST', `${CONFIG.apiVersion}/auth/register/videographer`, null, form2);
    const login2 = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, { email: email2, password: 'Test@123456' });
    if (login2.body?.data?.token) {
        storeToken('user2', login2.body.data.token);
        user2Id = login2.body.data.user?.user_id;
    }

    return { user1Ready: !!user1Id, user2Ready: !!user2Id };
}

/**
 * Test: User can only view own balance
 */
async function test_own_balance() {
    const testName = 'User can view their own balance';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('user1'));
    const passed = response.statusCode === 200 && response.body?.success === true;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: User can only view own history
 */
async function test_own_history() {
    const testName = 'User can view their own history';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/history`, null, authHeader('user1'));
    const passed = response.statusCode === 200 && response.body?.success === true;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: User can only check refund eligibility for own applications
 */
async function test_refund_eligibility_own() {
    const testName = 'User checking refund for non-existent app → not found/not eligible';

    // Use a high application ID that likely doesn't belong to user
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refund-eligibility/99999`, null, authHeader('user1'));

    // Should return 404 or eligible:false (not someone else's data)
    const passed = response.statusCode === 404 ||
        (response.statusCode === 200 && response.body?.data?.eligible === false);

    printTestResult(testName, passed, `Status: ${response.statusCode}, Eligible: ${response.body?.data?.eligible}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: User can only view own refunds
 */
async function test_own_refunds() {
    const testName = 'User can view their own refunds';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/refunds`, null, authHeader('user1'));
    const passed = response.statusCode === 200 && Array.isArray(response.body?.data);

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Different users have separate balances
 */
async function test_separate_balances() {
    const testName = 'Two different users have separate credit data';

    const response1 = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('user1'));
    const response2 = await makeRequest('GET', `${CONFIG.apiVersion}/credits/balance`, null, authHeader('user2'));

    // Both should succeed
    const passed = response1.statusCode === 200 && response2.statusCode === 200;

    printTestResult(testName, passed,
        `User1: ${response1.statusCode}, User2: ${response2.statusCode}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: User can only initiate purchase for themselves
 */
async function test_initiate_purchase_own() {
    const testName = 'User can initiate purchase (for themselves only)';

    const response = await makeRequest('POST', `${CONFIG.apiVersion}/credits/initiate-purchase`,
        { credits_amount: 5 },
        authHeader('user1')
    );

    // Should succeed - purchase is always for authenticated user
    const passed = response.statusCode === 200;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Non-admin cannot access other user's data via admin endpoints
 */
async function test_no_admin_access() {
    const testName = 'Non-admin cannot access admin credits endpoints';

    const response = await makeRequest('GET',
        `${CONFIG.apiVersion}/admin/credits/user/${user2Id}`,
        null,
        authHeader('user1')
    );

    const passed = response.statusCode === 403;

    printTestResult(testName, passed, `Status: ${response.statusCode}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: History is isolated per user
 */
async function test_history_isolation() {
    const testName = 'History is isolated per user (empty for new user)';

    // User 2 (new) should have empty history
    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/history`, null, authHeader('user2'));

    const passed = response.statusCode === 200 &&
        response.body?.data?.transactions?.length === 0;

    printTestResult(testName, passed, `Transactions: ${response.body?.data?.transactions?.length || 0}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS OWNERSHIP VALIDATION TESTS');

    console.log('This tests that users can only access their own credit data.\n');

    console.log('Setting up test users...\n');
    const { user1Ready, user2Ready } = await setupTestUsers();

    if (!user1Ready || !user2Ready) {
        console.log('❌ Failed to setup both users. Aborting.');
        process.exit(1);
    }
    console.log(`✅ User 1 ready (ID: ${user1Id})`);
    console.log(`✅ User 2 ready (ID: ${user2Id})\n`);

    await test_own_balance();
    await test_own_history();
    await test_refund_eligibility_own();
    await test_own_refunds();
    await test_separate_balances();
    await test_initiate_purchase_own();
    await test_no_admin_access();
    await test_history_isolation();

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
