const io = require('socket.io-client');
const dotenv = require('dotenv');
dotenv.config();

// Configuration
// Adjust these values as needed
const SOCKET_URL = process.env.API_URL || 'http://localhost:5000'; // Assuming backend port 5000
const AUTH_TOKEN = 'YOUR_TEST_TOKEN_HERE'; // User needs to provide a valid JWT token
const USER_ID = 1; // Change to the user ID you are testing with

console.log(`Connecting to ${SOCKET_URL} with user_id ${USER_ID}...`);

const socket = io(SOCKET_URL, {
    auth: {
        token: AUTH_TOKEN
    },
    query: {
        user_id: USER_ID
    },
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log('✅ Connected to socket server! ID:', socket.id);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection Error:', err.message);
});

socket.on('new_notification', (payload) => {
    console.log('🔔 RECEIVED NOTIFICATION:', JSON.stringify(payload, null, 2));
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected');
});

// Keep alive
setInterval(() => { }, 1000);
