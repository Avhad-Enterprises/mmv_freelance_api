const {
    CONFIG,
    makeRequest,
    printTestResult,
    printSection,
    printSummary,
    storeToken,
    authHeader,
    TEST_COUNTERS
} = require('../test-utils');

/**
 * Dynamic RBAC Test Suite
 * Tests CRUD operations for Roles, Permissions, and User Permissions
 */

let roleId = null;
let permissionId = null;

// Clean up any test artifacts if they exist
async function cleanup(token) {
    // We can't easily query by name to delete effectively without an ID, 
    // but in a real test env we would likely reset the DB or have dedicated teardown.
    // For now, we rely on the specific IDs we create.
    if (roleId) {
        await makeRequest('DELETE', `${CONFIG.apiVersion}/admin/rbac/roles/${roleId}`, null, authHeader('superAdmin'));
    }
    if (permissionId) {
        await makeRequest('DELETE', `${CONFIG.apiVersion}/admin/rbac/permissions/${permissionId}`, null, authHeader('superAdmin'));
    }
}

async function loginAsSuperAdmin() {
    try {
        const response = await makeRequest('POST', `${CONFIG.apiVersion}/auth/login`, {
            email: 'testadmin@example.com', // Assuming this user exists and is Super Admin
            password: 'TestAdmin123!'
        });

        if (response.statusCode === 200 && response.body?.data?.token) {
            storeToken('superAdmin', response.body.data.token);
            printTestResult('Super Admin Login', true);
            return true;
        }
        printTestResult('Super Admin Login', false, 'Failed to login', response.body);
        return false;
    } catch (error) {
        printTestResult('Super Admin Login', false, error.message);
        return false;
    }
}

async function testRoleManagement() {
    printSection('Role Management Tests');
    const token = authHeader('superAdmin');

    // 1. Create Role
    const createRes = await makeRequest('POST', `${CONFIG.apiVersion}/admin/rbac/roles`, {
        name: `TEST_ROLE_${Date.now()}`,
        description: 'Automated test role',
        is_active: true
    }, token);

    const createPassed = createRes.statusCode === 201 && createRes.body.data.role_id;
    printTestResult('Create Role', createPassed, '', createRes.body);
    if (createPassed) roleId = createRes.body.data.role_id;

    // 2. Get Roles
    const getRes = await makeRequest('GET', `${CONFIG.apiVersion}/role`, null, token);
    printTestResult('Get All Roles', getRes.statusCode === 200 && Array.isArray(getRes.body.data));

    // 3. Update Role
    if (roleId) {
        const updateRes = await makeRequest('PUT', `${CONFIG.apiVersion}/admin/rbac/roles/${roleId}`, {
            description: 'Updated description'
        }, token);
        printTestResult('Update Role', updateRes.statusCode === 200 && updateRes.body.data.description === 'Updated description');
    }

    // 4. Delete Role (will be done in cleanup)
}

async function testPermissionManagement() {
    printSection('Permission Management Tests');
    const token = authHeader('superAdmin');

    // 1. Create Permission
    const createRes = await makeRequest('POST', `${CONFIG.apiVersion}/admin/rbac/permissions`, {
        name: `test.permission.${Date.now()}`,
        label: 'Test Permission',
        module: 'test',
        is_critical: false
    }, token);

    const createPassed = createRes.statusCode === 201 && createRes.body.data.permission_id;
    printTestResult('Create Permission', createPassed, '', createRes.body);
    if (createPassed) permissionId = createRes.body.data.permission_id;

    // 2. Get Permissions
    const getRes = await makeRequest('GET', `${CONFIG.apiVersion}/permission`, null, token);
    printTestResult('Get All Permissions', getRes.statusCode === 200 && Array.isArray(getRes.body.data));

    // 3. Update Permission
    if (permissionId) {
        const updateRes = await makeRequest('PUT', `${CONFIG.apiVersion}/admin/rbac/permissions/${permissionId}`, {
            label: 'Updated Label'
        }, token);
        printTestResult('Update Permission', updateRes.statusCode === 200 && updateRes.body.data.label === 'Updated Label');
    }
}

async function testRolePermissionLinking() {
    printSection('Role-Permission Linking Tests');
    if (!roleId || !permissionId) {
        printTestResult('Linking Tests', false, 'Skipping - missing role or permission');
        return;
    }
    const token = authHeader('superAdmin');

    // 1. Assign Permission
    const assignRes = await makeRequest('POST', `${CONFIG.apiVersion}/admin/rbac/roles/${roleId}/permissions`, {
        permission_id: permissionId
    }, token);
    printTestResult('Assign Permission to Role', assignRes.statusCode === 200);

    // 2. Verify Assignment
    const getRes = await makeRequest('GET', `${CONFIG.apiVersion}/role/${roleId}/permissions`, null, token);
    const isAssigned = getRes.body.data && getRes.body.data.some(p => p.permission_id === permissionId);
    printTestResult('Verify Assignment', getRes.statusCode === 200 && isAssigned);

    // 3. Remove Permission
    const removeRes = await makeRequest('DELETE', `${CONFIG.apiVersion}/admin/rbac/roles/${roleId}/permissions/${permissionId}`, null, token);
    printTestResult('Remove Permission from Role', removeRes.statusCode === 200);
}

async function run() {
    console.log('🚀 Starting Dynamic RBAC Tests...');
    const isLoggedIn = await loginAsSuperAdmin();
    if (isLoggedIn) {
        await testRoleManagement();
        await testPermissionManagement();
        await testRolePermissionLinking();
        await cleanup();
    }

    printSummary(TEST_COUNTERS.passed, TEST_COUNTERS.failed);
}

// Execute if run directly
if (require.main === module) {
    run();
}

module.exports = { runAllTests: run };
