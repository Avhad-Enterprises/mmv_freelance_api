#!/usr/bin/env node

/**
 * Credits Packages API Tests
 * Tests GET /api/v1/credits/packages endpoint
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
 * Setup test videographer (reuse from balance tests)
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

    const email = randomEmail('credits-packages');
    const formData = new FormData();
    formData.append('first_name', 'PackagesTest');
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
 * Test: GET packages returns all packages
 */
async function test_GET_packages_returns_all() {
    const testName = 'GET /credits/packages returns all 4 packages';

    const response = await makeRequest('GET', `${CONFIG.apiVersion}/credits/packages`, null, authHeader('videographer'));

    const passed = response.statusCode === 200 &&
        response.body?.data?.packages?.length === 4;

    printTestResult(testName, passed,
        `Status: ${response.statusCode}, Packages: ${response.body?.data?.packages?.length}`
    );
    passed ? passedTests++ : failedTests++;
    return response;
}

/**
 * Test: Each package has required structure
 */
async function test_package_structure(packagesResponse) {
    const testName = 'Each package has id, name, credits, price, description';

    if (!packagesResponse || packagesResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid packages response');
        failedTests++;
        return;
    }

    const packages = packagesResponse.body?.data?.packages || [];
    const allValid = packages.every(pkg =>
        typeof pkg.id === 'number' &&
        typeof pkg.name === 'string' &&
        typeof pkg.credits === 'number' &&
        typeof pkg.price === 'number' &&
        typeof pkg.description === 'string'
    );

    printTestResult(testName, allValid,
        `All packages have required fields: ${allValid}`
    );
    allValid ? passedTests++ : failedTests++;
}

/**
 * Test: Pricing formula is correct (price = credits × 50)
 */
async function test_pricing_formula(packagesResponse) {
    const testName = 'Package pricing follows ₹50/credit formula';

    if (!packagesResponse || packagesResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid packages response');
        failedTests++;
        return;
    }

    const packages = packagesResponse.body?.data?.packages || [];
    const pricePerCredit = packagesResponse.body?.data?.pricePerCredit || 50;

    const allCorrect = packages.every(pkg => pkg.price === pkg.credits * pricePerCredit);

    // Log each package for verification
    const details = packages.map(p => `${p.name}: ${p.credits}×${pricePerCredit}=₹${p.price}`).join(', ');

    printTestResult(testName, allCorrect, details);
    allCorrect ? passedTests++ : failedTests++;
}

/**
 * Test: Response includes limits
 */
async function test_includes_limits(packagesResponse) {
    const testName = 'Response includes purchase limits';

    if (!packagesResponse || packagesResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid packages response');
        failedTests++;
        return;
    }

    const data = packagesResponse.body?.data;
    const hasLimits = data?.limits &&
        typeof data.limits.minPurchase === 'number' &&
        typeof data.limits.maxPurchase === 'number' &&
        typeof data.limits.maxBalance === 'number';

    const correctLimits = data?.limits?.minPurchase === 1 &&
        data?.limits?.maxPurchase === 200 &&
        data?.limits?.maxBalance === 1000;

    const passed = hasLimits && correctLimits;

    printTestResult(testName, passed,
        `Min: ${data?.limits?.minPurchase}, Max: ${data?.limits?.maxPurchase}, MaxBalance: ${data?.limits?.maxBalance}`
    );
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Expected packages exist
 */
async function test_expected_packages(packagesResponse) {
    const testName = 'Expected packages exist (Starter, Basic, Pro, Business)';

    if (!packagesResponse || packagesResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid packages response');
        failedTests++;
        return;
    }

    const packages = packagesResponse.body?.data?.packages || [];
    const names = packages.map(p => p.name);

    const hasStarter = names.includes('Starter');
    const hasBasic = names.includes('Basic');
    const hasPro = names.includes('Pro');
    const hasBusiness = names.includes('Business');

    const passed = hasStarter && hasBasic && hasPro && hasBusiness;

    printTestResult(testName, passed, `Packages: ${names.join(', ')}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Test: Currency is INR
 */
async function test_currency_inr(packagesResponse) {
    const testName = 'Currency is INR';

    if (!packagesResponse || packagesResponse.statusCode !== 200) {
        printTestResult(testName, false, 'No valid packages response');
        failedTests++;
        return;
    }

    const currency = packagesResponse.body?.data?.currency;
    const passed = currency === 'INR';

    printTestResult(testName, passed, `Currency: ${currency}`);
    passed ? passedTests++ : failedTests++;
}

/**
 * Main test runner
 */
async function runTests() {
    printSection('CREDITS PACKAGES API TESTS');

    console.log('Setting up test user...\n');
    const ready = await setupVideographer();
    if (!ready) {
        console.log('❌ Failed to setup user. Aborting tests.');
        process.exit(1);
    }
    console.log('✅ User ready\n');

    // Run tests
    const packagesResponse = await test_GET_packages_returns_all();
    await test_package_structure(packagesResponse);
    await test_pricing_formula(packagesResponse);
    await test_includes_limits(packagesResponse);
    await test_expected_packages(packagesResponse);
    await test_currency_inr(packagesResponse);

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
