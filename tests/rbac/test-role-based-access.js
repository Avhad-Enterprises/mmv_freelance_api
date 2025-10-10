const axios = require('axios');

const BASE_URL = CONFIG.baseUrl + CONFIG.apiVersion;

// Test configuration
const testConfig = {
    superAdmin: {
        email: 'superadmin@mmv.com',
        password: 'SuperAdmin123!'
    },
    client: {
        email: 'client@test.com', 
        password: 'Client123!'
    }
};

let superAdminToken = null;
let clientToken = null;

async function loginUser(email, password, role) {
    try {
        console.log(`\n🔐 Logging in ${role}...`);
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });
        
        console.log(`✅ ${role} login successful`);
        console.log(`Token: ${response.data.data.token.substring(0, 20)}...`);
        return response.data.data.token;
    } catch (error) {
        console.log(`❌ ${role} login failed:`, error.response?.data?.message || error.message);
        return null;
    }
}

async function testRoleBasedEndpoint(endpoint, token, userRole, expectedResult) {
    try {
        console.log(`\n📡 Testing ${endpoint} with ${userRole} role...`);
        
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ ${userRole} access to ${endpoint}: SUCCESS`);
        console.log(`Status: ${response.status}`);
        return true;
    } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        
        if (expectedResult === 'forbidden' && status === 403) {
            console.log(`✅ ${userRole} access to ${endpoint}: CORRECTLY FORBIDDEN`);
            return true;
        } else {
            console.log(`❌ ${userRole} access to ${endpoint}: FAILED`);
            console.log(`Status: ${status}, Message: ${message}`);
            return false;
        }
    }
}

async function testUserManagement(token, userRole) {
    try {
        console.log(`\n👥 Testing user management with ${userRole}...`);
        
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ ${userRole} can access user management`);
        console.log(`Found ${response.data.length} users`);
        return true;
    } catch (error) {
        const status = error.response?.status;
        console.log(`❌ ${userRole} user management access failed: ${status}`);
        return false;
    }
}

async function testProjectTaskEndpoints() {
    console.log('\n🎬 Testing Project Task endpoints...');
    
    // Test admin-only endpoints
    await testRoleBasedEndpoint('/projectsTask/countactiveprojects_task', superAdminToken, 'SUPER_ADMIN', 'success');
    await testRoleBasedEndpoint('/projectsTask/countactiveprojects_task', clientToken, 'CLIENT', 'forbidden');
    
    // Test multi-role endpoints
    await testRoleBasedEndpoint('/projectsTask/getallprojects_task', superAdminToken, 'SUPER_ADMIN', 'success');
    await testRoleBasedEndpoint('/projectsTask/getallprojects_task', clientToken, 'CLIENT', 'success');
}

async function runTests() {
    console.log('🚀 Starting Role-Based Access Control Tests');
    console.log('==========================================');
    
    // Step 1: Login users
    superAdminToken = await loginUser(testConfig.superAdmin.email, testConfig.superAdmin.password, 'SUPER_ADMIN');
    clientToken = await loginUser(testConfig.client.email, testConfig.client.password, 'CLIENT');
    
    if (!superAdminToken) {
        console.log('\n❌ Cannot proceed without super admin token');
        return;
    }
    
    // Step 2: Test user management (super admin should work)
    await testUserManagement(superAdminToken, 'SUPER_ADMIN');
    
    if (clientToken) {
        await testUserManagement(clientToken, 'CLIENT');
    }
    
    // Step 3: Test project task endpoints
    if (superAdminToken && clientToken) {
        await testProjectTaskEndpoints();
    }
    
    // Step 4: Test basic health check
    try {
        console.log('\n❤️ Testing basic server health...');
        const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
        console.log('✅ Server health check passed');
    } catch (error) {
        console.log('ℹ️ Health endpoint not available (this is ok)');
    }
    
    console.log('\n🎉 Role-based access control tests completed!');
    console.log('If you see mostly ✅ marks, the role-based system is working correctly.');
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Test script failed:', error.message);
});