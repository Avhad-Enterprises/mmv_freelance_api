#!/usr/bin/env node

/**
 * Socket.IO Test Suite
 * Tests for socket connection, authentication, and notification delivery
 */

const io = require('socket.io-client');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

// ============================================
// Configuration
// ============================================

const CONFIG = {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8000',
    socketPath: '/socket.io',
    timeout: 10000,
    verbose: process.env.VERBOSE === 'true',
};

// Color codes
const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    gray: '\x1b[90m',
};

// Test counters
let passed = 0;
let failed = 0;

// ============================================
// Helper Functions
// ============================================

function printResult(testName, success, message = '') {
    if (success) {
        passed++;
        console.log(`${COLORS.green}✓ PASS${COLORS.reset} ${testName}`);
    } else {
        failed++;
        console.log(`${COLORS.red}✗ FAIL${COLORS.reset} ${testName}`);
    }
    if (message) {
        console.log(`  ${COLORS.gray}${message}${COLORS.reset}`);
    }
}

function printSection(title) {
    console.log(`\n${COLORS.blue}${'='.repeat(60)}${COLORS.reset}`);
    console.log(`${COLORS.blue}${title}${COLORS.reset}`);
    console.log(`${COLORS.blue}${'='.repeat(60)}${COLORS.reset}\n`);
}

function printSummary() {
    console.log(`\n${COLORS.blue}${'='.repeat(60)}${COLORS.reset}`);
    console.log(`${COLORS.blue}SOCKET TEST SUMMARY${COLORS.reset}`);
    console.log(`${COLORS.blue}${'='.repeat(60)}${COLORS.reset}`);
    console.log(`Total:  ${passed + failed}`);
    console.log(`${COLORS.green}Passed: ${passed}${COLORS.reset}`);
    console.log(`${COLORS.red}Failed: ${failed}${COLORS.reset}`);
    console.log(`${COLORS.blue}${'='.repeat(60)}${COLORS.reset}\n`);
}

/**
 * Login and get a valid JWT token
 */
async function getAuthToken(email, password) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${CONFIG.baseUrl}/api/v1/auth/login`);
        const data = JSON.stringify({ email, password });

        const options = {
            method: 'POST',
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
            timeout: CONFIG.timeout,
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.data?.token) {
                        resolve(response.data.token);
                    } else {
                        reject(new Error(response.message || 'Login failed'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse login response'));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Login request timeout'));
        });

        req.write(data);
        req.end();
    });
}

/**
 * Create a socket connection
 */
function createSocket(token) {
    return io(CONFIG.baseUrl, {
        auth: { token },
        path: CONFIG.socketPath,
        transports: ['websocket', 'polling'],
        timeout: CONFIG.timeout,
        forceNew: true,
    });
}

// ============================================
// Test Cases
// ============================================

async function testSocketConnectionWithValidToken(token) {
    return new Promise((resolve) => {
        const socket = createSocket(token);
        let resolved = false;

        socket.on('connect', () => {
            if (!resolved) {
                resolved = true;
                printResult('Socket connection with valid token', true, `Socket ID: ${socket.id}`);
                socket.disconnect();
                resolve(true);
            }
        });

        socket.on('connect_error', (err) => {
            if (!resolved) {
                resolved = true;
                printResult('Socket connection with valid token', false, err.message);
                socket.disconnect();
                resolve(false);
            }
        });

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                printResult('Socket connection with valid token', false, 'Connection timeout');
                socket.disconnect();
                resolve(false);
            }
        }, CONFIG.timeout);
    });
}

async function testSocketRejectionWithInvalidToken() {
    return new Promise((resolve) => {
        const socket = createSocket('invalid-token-12345');
        let resolved = false;

        socket.on('connect', () => {
            if (!resolved) {
                resolved = true;
                printResult('Socket rejection with invalid token', false, 'Connection should have been rejected');
                socket.disconnect();
                resolve(false);
            }
        });

        socket.on('connect_error', (err) => {
            if (!resolved) {
                resolved = true;
                const success = err.message.includes('Authentication');
                printResult('Socket rejection with invalid token', success, err.message);
                socket.disconnect();
                resolve(success);
            }
        });

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                printResult('Socket rejection with invalid token', false, 'Connection timeout');
                socket.disconnect();
                resolve(false);
            }
        }, CONFIG.timeout);
    });
}

async function testSocketRejectionWithNoToken() {
    return new Promise((resolve) => {
        const socket = io(CONFIG.baseUrl, {
            path: CONFIG.socketPath,
            transports: ['websocket', 'polling'],
            timeout: CONFIG.timeout,
            forceNew: true,
        });
        let resolved = false;

        socket.on('connect', () => {
            if (!resolved) {
                resolved = true;
                printResult('Socket rejection with no token', false, 'Connection should have been rejected');
                socket.disconnect();
                resolve(false);
            }
        });

        socket.on('connect_error', (err) => {
            if (!resolved) {
                resolved = true;
                const success = err.message.includes('Authentication') || err.message.includes('No token');
                printResult('Socket rejection with no token', success, err.message);
                socket.disconnect();
                resolve(success);
            }
        });

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                printResult('Socket rejection with no token', false, 'Connection timeout');
                socket.disconnect();
                resolve(false);
            }
        }, CONFIG.timeout);
    });
}

async function testPingCheck(token) {
    return new Promise((resolve) => {
        const socket = createSocket(token);
        let resolved = false;

        socket.on('connect', () => {
            socket.emit('ping_check', (response) => {
                if (!resolved) {
                    resolved = true;
                    const success = response && response.status === 'ok';
                    printResult('Ping check event', success, success ? `Timestamp: ${response.timestamp}` : 'Invalid response');
                    socket.disconnect();
                    resolve(success);
                }
            });
        });

        socket.on('connect_error', (err) => {
            if (!resolved) {
                resolved = true;
                printResult('Ping check event', false, `Connection failed: ${err.message}`);
                socket.disconnect();
                resolve(false);
            }
        });

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                printResult('Ping check event', false, 'Timeout');
                socket.disconnect();
                resolve(false);
            }
        }, CONFIG.timeout);
    });
}

async function testMultipleConnections(token) {
    return new Promise((resolve) => {
        const sockets = [];
        let connectCount = 0;
        const targetConnections = 3;
        let resolved = false;

        for (let i = 0; i < targetConnections; i++) {
            const socket = createSocket(token);
            sockets.push(socket);

            socket.on('connect', () => {
                connectCount++;
                if (connectCount === targetConnections && !resolved) {
                    resolved = true;
                    printResult('Multiple socket connections', true, `${connectCount} sockets connected`);
                    sockets.forEach(s => s.disconnect());
                    resolve(true);
                }
            });

            socket.on('connect_error', (err) => {
                if (!resolved) {
                    resolved = true;
                    printResult('Multiple socket connections', false, err.message);
                    sockets.forEach(s => s.disconnect());
                    resolve(false);
                }
            });
        }

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                printResult('Multiple socket connections', false, `Only ${connectCount}/${targetConnections} connected`);
                sockets.forEach(s => s.disconnect());
                resolve(false);
            }
        }, CONFIG.timeout);
    });
}

// ============================================
// Main Test Runner
// ============================================

async function runTests() {
    console.log(`\n${COLORS.yellow}🔌 Socket.IO Test Suite${COLORS.reset}`);
    console.log(`${COLORS.gray}Target: ${CONFIG.baseUrl}${COLORS.reset}\n`);

    // Get credentials from environment or use defaults
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_PASSWORD || 'password123';

    printSection('Authentication');

    let token;
    try {
        token = await getAuthToken(testEmail, testPassword);
        printResult('Login and get token', true, `Token length: ${token.length}`);
    } catch (err) {
        printResult('Login and get token', false, err.message);
        console.log(`\n${COLORS.yellow}⚠️  Cannot run socket tests without a valid token.${COLORS.reset}`);
        console.log(`${COLORS.gray}Set TEST_EMAIL and TEST_PASSWORD environment variables.${COLORS.reset}\n`);
        printSummary();
        process.exit(failed > 0 ? 1 : 0);
    }

    printSection('Socket Connection Tests');
    await testSocketConnectionWithValidToken(token);
    await testSocketRejectionWithInvalidToken();
    await testSocketRejectionWithNoToken();

    printSection('Socket Feature Tests');
    await testPingCheck(token);
    await testMultipleConnections(token);

    printSummary();
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((err) => {
    console.error(`${COLORS.red}Test runner error:${COLORS.reset}`, err);
    process.exit(1);
});
