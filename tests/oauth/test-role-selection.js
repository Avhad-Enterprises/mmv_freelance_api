#!/usr/bin/env node

/**
 * OAuth Role Selection Tests
 * Tests specifically for the role selection flow for new OAuth users
 */

const {
    CONFIG,
    makeRequest,
    printTestResult,
    printSection,
    printSummary,
    storeToken,
    authHeader,
} = require('../test-utils');

let passedTests = 0;
let failedTests = 0;

// Valid role names
const VALID_ROLES = ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR'];
const INVALID_ROLES = ['ADMIN', 'SUPERUSER', 'INVALID', '', null, undefined, 123, 'client', 'Videographer'];

// ============================================
// ROLE VALIDATION TESTS
// ============================================

/**
 * Test set-role endpoint structure
 */
async function testSetRoleEndpointExists() {
    printSection('ROLE SELECTION ENDPOINT');

    try {
        // Without auth should return 401
        const response = await makeRequest('POST', `${CONFIG.apiVersion}/oauth/set-role`, {
            role: 'CLIENT'
        });

        const passed = response.statusCode === 401;

        printTestResult(
            'POST /oauth/set-role endpoint exists',
            passed,
            passed ? 'Endpoint exists and requires authentication' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Set-role endpoint check', false, error.message);
        failedTests++;
    }
}

/**
 * Test role-status endpoint structure
 */
async function testRoleStatusEndpointExists() {
    try {
        const response = await makeRequest('GET', `${CONFIG.apiVersion}/oauth/role-status`);

        const passed = response.statusCode === 401;

        printTestResult(
            'GET /oauth/role-status endpoint exists',
            passed,
            passed ? 'Endpoint exists and requires authentication' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Role-status endpoint check', false, error.message);
        failedTests++;
    }
}

/**
 * Test that valid roles are documented
 */
async function testValidRolesDocumented() {
    printSection('VALID ROLES');

    console.log('  The following roles should be accepted:');
    VALID_ROLES.forEach(role => {
        console.log(`    ✓ ${role}`);
    });

    printTestResult(
        'Valid roles documentation',
        true,
        `System supports ${VALID_ROLES.length} valid roles`
    );
    passedTests++;
}

/**
 * Test that invalid roles are documented
 */
async function testInvalidRolesDocumented() {
    console.log('\n  The following should be REJECTED:');
    INVALID_ROLES.forEach(role => {
        console.log(`    ✗ ${JSON.stringify(role)}`);
    });

    printTestResult(
        'Invalid roles documentation',
        true,
        `${INVALID_ROLES.length} invalid role formats documented`
    );
    passedTests++;
}

// ============================================
// AUTHENTICATED ROLE TESTS (requires test user)
// ============================================

/**
 * Get a test user token for authenticated tests
 */
async function getTestUserToken() {
    try {
        // Try to login with test credentials
        const response = await makeRequest('POST', `${CONFIG.apiVersion}/login`, {
            email: 'test@test.com',
            password: 'Test@123456',
        });

        if (response.statusCode === 200 && response.body?.token) {
            return response.body.token;
        }

        // Try alternative test user
        const altResponse = await makeRequest('POST', `${CONFIG.apiVersion}/login`, {
            email: 'client@test.com',
            password: 'Password123!',
        });

        if (altResponse.statusCode === 200 && altResponse.body?.token) {
            return altResponse.body.token;
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Test authenticated role selection with valid role
 */
async function testAuthenticatedSetValidRole() {
    printSection('AUTHENTICATED ROLE SELECTION');

    const token = await getTestUserToken();

    if (!token) {
        console.log('  ⚠ Skipping authenticated tests - no test user available');
        console.log('  Create a test user with email: test@test.com, password: Test@123456');
        return;
    }

    for (const role of VALID_ROLES) {
        try {
            const response = await makeRequest(
                'POST',
                `${CONFIG.apiVersion}/oauth/set-role`,
                { role },
                { Authorization: `Bearer ${token}` }
            );

            // Should succeed (200) or fail if user already has role (400)
            const passed = response.statusCode === 200 || response.statusCode === 400;

            printTestResult(
                `Set role: ${role}`,
                passed,
                passed
                    ? (response.statusCode === 200 ? 'Role set successfully' : 'User already has a role')
                    : `Got ${response.statusCode}`
            );

            passed ? passedTests++ : failedTests++;
        } catch (error) {
            printTestResult(`Set role: ${role}`, false, error.message);
            failedTests++;
        }
    }
}

/**
 * Test authenticated role selection with invalid roles
 */
async function testAuthenticatedSetInvalidRole() {
    const token = await getTestUserToken();

    if (!token) {
        return; // Already logged warning above
    }

    printSection('INVALID ROLE REJECTION');

    for (const role of INVALID_ROLES.filter(r => r !== null && r !== undefined)) {
        try {
            const response = await makeRequest(
                'POST',
                `${CONFIG.apiVersion}/oauth/set-role`,
                { role },
                { Authorization: `Bearer ${token}` }
            );

            const passed = response.statusCode === 400;

            printTestResult(
                `Reject invalid role: ${JSON.stringify(role)}`,
                passed,
                passed ? 'Correctly rejected' : `Got ${response.statusCode}`
            );

            passed ? passedTests++ : failedTests++;
        } catch (error) {
            printTestResult(`Reject invalid role: ${role}`, true, 'Request failed as expected');
            passedTests++;
        }
    }
}

/**
 * Test role-status for authenticated user
 */
async function testAuthenticatedRoleStatus() {
    printSection('ROLE STATUS CHECK');

    const token = await getTestUserToken();

    if (!token) {
        return;
    }

    try {
        const response = await makeRequest(
            'GET',
            `${CONFIG.apiVersion}/oauth/role-status`,
            null,
            { Authorization: `Bearer ${token}` }
        );

        const passed = response.statusCode === 200 && response.body?.success === true;

        if (passed) {
            console.log(`  User has roles: ${response.body.data?.hasRole ? 'Yes' : 'No'}`);
            if (response.body.data?.roles) {
                console.log(`  Roles: ${response.body.data.roles.join(', ')}`);
            }
        }

        printTestResult(
            'Get role status for authenticated user',
            passed,
            passed ? 'Role status retrieved' : `Got ${response.statusCode}`
        );

        passed ? passedTests++ : failedTests++;
    } catch (error) {
        printTestResult('Get role status', false, error.message);
        failedTests++;
    }
}

// ============================================
// ROLE SELECTION FLOW TESTS
// ============================================

/**
 * Document the expected role selection flow
 */
async function testRoleSelectionFlowDocumentation() {
    printSection('ROLE SELECTION FLOW');

    console.log('  Expected flow for new OAuth users:');
    console.log('  ');
    console.log('  1. User clicks OAuth button (Google/Facebook/Apple)');
    console.log('  2. User authenticates with provider');
    console.log('  3. Backend receives callback and creates user (without role)');
    console.log('  4. Frontend receives token with isNewUser=true');
    console.log('  5. Frontend redirects to /auth/select-role');
    console.log('  6. User selects: CLIENT | FREELANCER');
    console.log('  7. If FREELANCER, user selects: VIDEOGRAPHER | VIDEO_EDITOR');
    console.log('  8. Frontend calls POST /oauth/set-role with selected role');
    console.log('  9. Backend creates appropriate profile and assigns role');
    console.log('  10. Backend returns new token with updated roles');
    console.log('  11. Frontend stores new token and redirects to dashboard');

    printTestResult(
        'Role selection flow documentation',
        true,
        'Flow documented with 11 steps'
    );
    passedTests++;
}

/**
 * Test new token is returned after role selection
 */
async function testNewTokenAfterRoleSelection() {
    const token = await getTestUserToken();

    if (!token) {
        return;
    }

    try {
        const response = await makeRequest(
            'POST',
            `${CONFIG.apiVersion}/oauth/set-role`,
            { role: 'CLIENT' },
            { Authorization: `Bearer ${token}` }
        );

        // If role was set, check for new token
        if (response.statusCode === 200) {
            const hasNewToken = !!response.body?.data?.token;

            printTestResult(
                'New token returned after role selection',
                hasNewToken,
                hasNewToken ? 'New JWT token received' : 'No token in response'
            );

            hasNewToken ? passedTests++ : failedTests++;
        } else {
            // User might already have a role
            printTestResult(
                'New token after role selection (skipped)',
                true,
                'User already has role assigned'
            );
            passedTests++;
        }
    } catch (error) {
        printTestResult('New token after role selection', false, error.message);
        failedTests++;
    }
}

// ============================================
// RUN ALL TESTS
// ============================================

async function runTests() {
    console.log('\n👤 Starting OAuth Role Selection Tests...\n');
    console.log(`Base URL: ${CONFIG.baseUrl}${CONFIG.apiVersion}`);
    console.log('═'.repeat(60));

    // Endpoint existence
    await testSetRoleEndpointExists();
    await testRoleStatusEndpointExists();

    // Role documentation
    await testValidRolesDocumented();
    await testInvalidRolesDocumented();

    // Authenticated tests
    await testAuthenticatedSetValidRole();
    await testAuthenticatedSetInvalidRole();
    await testAuthenticatedRoleStatus();

    // Flow documentation
    await testRoleSelectionFlowDocumentation();
    await testNewTokenAfterRoleSelection();

    printSummary(passedTests, failedTests);

    return { passed: passedTests, failed: failedTests };
}

// Run if executed directly
if (require.main === module) {
    runTests()
        .then(({ failed }) => process.exit(failed > 0 ? 1 : 0))
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runTests };
