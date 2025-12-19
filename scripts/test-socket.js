#!/usr/bin/env node

/**
 * Quick Socket Connection Test
 * 
 * Usage:
 *   node scripts/test-socket.js
 * 
 * Environment Variables:
 *   - SOCKET_URL: Socket server URL (default: http://localhost:8000)
 *   - AUTH_TOKEN: Valid JWT token for authentication (required)
 * 
 * For comprehensive tests, run: node tests/socket/socket.test.js
 */

const io = require('socket.io-client');
const dotenv = require('dotenv');
dotenv.config();

// Configuration
const SOCKET_URL = process.env.SOCKET_URL || process.env.API_URL || 'http://localhost:8000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

if (!AUTH_TOKEN) {
    console.error('❌ AUTH_TOKEN environment variable is required.');
    console.log('   Set it with: AUTH_TOKEN="your-jwt-token" node scripts/test-socket.js');
    process.exit(1);
}

console.log(`🔌 Connecting to ${SOCKET_URL}...`);
console.log(`📝 Token length: ${AUTH_TOKEN.length}`);

const socket = io(SOCKET_URL, {
    auth: {
        token: AUTH_TOKEN
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    timeout: 10000,
});

socket.on('connect', () => {
    console.log('✅ Connected to socket server!');
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   Transport: ${socket.io.engine.transport.name}`);

    // Test ping_check event
    socket.emit('ping_check', (response) => {
        console.log('🏓 Ping check response:', response);
    });
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection Error:', err.message);
});

socket.on('new_notification', (payload) => {
    console.log('🔔 RECEIVED NOTIFICATION:');
    console.log(JSON.stringify(payload, null, 2));
});

socket.on('server_shutdown', (data) => {
    console.log('⚠️ Server shutting down:', data.message);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
});

socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
});

// Keep process alive
console.log('\n📡 Listening for notifications... (Press Ctrl+C to exit)\n');
setInterval(() => { }, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Disconnecting...');
    socket.disconnect();
    process.exit(0);
});
