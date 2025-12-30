import axios from 'axios';
import DB, { T } from '../database';

const BASE_URL = 'http://localhost:8000';

async function verifyLog(statusCode: number, path: string) {
    try {
        // Wait a brief moment for async writing to DB
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the latest log
        const log = await DB(T.SYSTEM_ERROR_LOGS)
            .orderBy('id', 'desc')
            .first();

        if (!log) {
            console.error(`❌ [FAILED] No logs found in database. (Did you run migration?)`);
            return false;
        }

        if (log.status_code === statusCode && log.path.includes(path)) {
            console.log(`✅ [PASS] Found expected log in DB: ID=${log.id} Status=${log.status_code} Path=${log.path}`);
            return true;
        } else {
            console.error(`❌ [FAILED] Log mismatch. Expected ${statusCode} ${path}, Got ${log.status_code} ${log.path}`);
            return false;
        }

    } catch (error: any) {
        if (error.message && error.message.includes('relation "system_error_logs" does not exist')) {
            console.error(`❌ [SKIPPED] Database check failed: Table 'system_error_logs' does not exist. Please run migration first.`);
            return false;
        }
        console.error('❌ [ERROR] Database check failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting System Error Logging Verification...');
    console.log('------------------------------------------------');

    let passed = 0;
    let failed = 0;

    // Test Case 1: 404 Not Found
    // We use a path NOT starting with /api/v1 to avoid the 401 Auth Middleware interception
    console.log('\nTEST 1: 404 Not Found (/non-existent-global-route)');
    try {
        await axios.get(`${BASE_URL}/non-existent-global-route`);
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            console.log('HTTP Response: 404 OK');
            const dbCheck = await verifyLog(404, '/non-existent-global-route');
            dbCheck ? passed++ : failed++;
        } else {
            console.log(`❌ HTTP Check Failed: Expected 404, Got ${error.response?.status || error.message}`);
            if (error.response?.data) console.log('Response Body:', JSON.stringify(error.response.data));
            failed++;
        }
    }

    // Test Case 2: 401 Unauthorized (Protected Route)
    // Assuming /api/v1/users/me requires auth
    console.log('\nTEST 2: 401 Unauthorized (/api/v1/users/me)');
    try {
        await axios.get(`${BASE_URL}/api/v1/users/me`);
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            console.log('HTTP Response: 401 OK');
            const dbCheck = await verifyLog(401, '/api/v1/users/me');
            dbCheck ? passed++ : failed++;
        } else {
            console.log(`❌ HTTP Check Failed: Expected 401, Got ${error.response?.status || error.message}`);
            if (error.response?.data) console.log('Response Body:', JSON.stringify(error.response.data));
            failed++;
        }
    }

    // Test Case 3: Public Route (No Error) - Should NOT log
    // We check that the latest log is still the one from Test 2
    console.log('\nTEST 3: 200 OK (Public Route /health) - Should NOT log');
    try {
        await axios.get(`${BASE_URL}/health`);
        console.log('HTTP Response: 200 OK');

        await new Promise(resolve => setTimeout(resolve, 500));
        const log = await DB(T.SYSTEM_ERROR_LOGS).orderBy('id', 'desc').first();

        // If the last log is still the 401 from previous test, then success.
        // We verify it's NOT a 200 log.
        if (!log || log.status_code !== 200) {
            console.log('✅ [PASS] No error log created for 200 OK');
            passed++;
        } else {
            console.error('❌ [FAILED] Log created for 200 OK!');
            failed++;
        }

    } catch (error: any) {
        console.error('❌ HTTP Request Failed unexpectedly:', error.message);
        failed++;
    }

    // Test Case 4: 400 Bad Request (Validation Error)
    console.log('\nTEST 4: 400 Bad Request (/api/v1/auth/login with empty body)');
    try {
        await axios.post(`${BASE_URL}/api/v1/auth/login`, {});
    } catch (error: any) {
        // Validation middleware typically returns 400 or 422
        if (error.response && (error.response.status === 400 || error.response.status === 422)) {
            console.log(`HTTP Response: ${error.response.status} OK`);
            const dbCheck = await verifyLog(error.response.status, '/api/v1/auth/login');
            dbCheck ? passed++ : failed++;
        } else {
            console.log(`❌ HTTP Check Failed: Expected 400/422, Got ${error.response?.status || error.message}`);
            if (error.response?.data) console.log('Response Body:', JSON.stringify(error.response.data));
            failed++;
        }
    }

    // Test Case 5: 413 Payload Too Large (or similar limiter)
    // Sending > 200mb (limit set in app.ts) is too heavy for a test script, 
    // so we'll test Method Not Allowed (POST to /health which is GET only)
    console.log('\nTEST 5: Method Mismatch (POST to /health)');
    try {
        await axios.post(`${BASE_URL}/health`, {});
    } catch (error: any) {
        // Express usually treats this as 404 (Not Found) because the specific POST route doesn't help.
        // But since we want to ensure it LOGS, we expect a 404 log entry for POST /health.
        if (error.response && error.response.status === 404) {
            console.log('HTTP Response: 404 (Route not found for POST) OK');
            const log = await DB(T.SYSTEM_ERROR_LOGS).orderBy('id', 'desc').first();

            // Verify we captured the POST method specifically
            if (log && log.status_code === 404 && log.method === 'POST') {
                console.log(`✅ [PASS] Found expected log: 404 POST /health`);
                passed++;
            } else if (!log) {
                console.error(`❌ [FAILED] No logs found.`);
                failed++;
            } else {
                console.error(`❌ [FAILED] Log mismatch. Expected 404 POST, Got ${log.status_code} ${log.method}`);
                failed++;
            }
        } else {
            console.log(`❌ HTTP Check Failed: Expected 404, Got ${error.response?.status}`);
            failed++;
        }
    }

    console.log('\n------------------------------------------------');
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);

    // Cleanup
    await DB.destroy();
}

runTests();
