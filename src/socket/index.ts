import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Client } from 'pg';
import { verify } from 'jsonwebtoken';
import { logger } from '../utils/logger';

// ============================================
// Type Definitions
// ============================================

interface NotificationPayload {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    created_at: string;
}

interface DecodedToken {
    id?: number;
    user_id?: number;
    email?: string;
    role?: string;
}

interface AuthenticatedSocket extends Socket {
    user?: DecodedToken;
}

// ============================================
// Configuration
// ============================================

const SOCKET_CONFIG = {
    // CORS - same origins as Express app in app.ts
    allowedOrigins: [
        "https://makemyvid.io",
        "https://www.makemyvid.io",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://192.168.1.20:3000",
        "http://192.168.1.20:3001"
    ],
    // Connection limits
    maxSocketsPerUser: 5,
    // Heartbeat settings (in ms)
    pingInterval: 25000,
    pingTimeout: 20000,
    // PostgreSQL reconnection settings
    maxReconnectAttempts: 10,
    initialReconnectDelay: 1000,
    maxReconnectDelay: 30000,
};

// ============================================
// Socket Service Class
// ============================================

class SocketService {
    private io!: SocketIOServer;
    private pgClient!: Client;
    private userSockets: Map<number, string[]> = new Map();

    // Reconnection state
    private reconnectAttempts = 0;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isShuttingDown = false;

    constructor() {
        this.userSockets = new Map();
    }

    /**
     * Initialize Socket.IO server with the HTTP server
     */
    public init(httpServer: HttpServer): void {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: SOCKET_CONFIG.allowedOrigins,
                methods: ["GET", "POST"],
                credentials: true
            },
            path: '/socket.io',
            // Heartbeat configuration
            pingInterval: SOCKET_CONFIG.pingInterval,
            pingTimeout: SOCKET_CONFIG.pingTimeout,
            // Connection settings
            transports: ['websocket', 'polling'],
            allowUpgrades: true,
        });

        this.setupMiddleware();
        this.setupConnectionHandler();
        this.setupDatabaseListener();

        logger.info('✅ Socket Server Initialized');
    }

    /**
     * Authentication middleware for socket connections
     */
    private setupMiddleware(): void {
        this.io.use((socket: AuthenticatedSocket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

                if (!token) {
                    logger.warn(`🔌 Socket Auth Failed: No token provided from ${socket.handshake.address}`);
                    return next(new Error('Authentication error: No token provided'));
                }

                // Remove Bearer prefix if present
                const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

                let secretKey = process.env.JWT_SECRET || process.env.SECRET_KEY;

                if (!secretKey) {
                    if (process.env.NODE_ENV === 'production') {
                        logger.error('FATAL: JWT_SECRET is not defined in production environment!');
                        return next(new Error('Server configuration error'));
                    }
                    logger.warn('⚠️ WARNING: Using fallback JWT secret for Socket. Set JWT_SECRET in .env file.');
                    secretKey = 'fallback-secret';
                }

                try {
                    const decoded = verify(tokenString, secretKey) as DecodedToken;
                    const userId = decoded.id || decoded.user_id;

                    if (!userId) {
                        logger.warn('🔌 Socket Auth Failed: Token has no user ID');
                        return next(new Error('Authentication error: Invalid token'));
                    }

                    logger.debug(`🔌 Socket Auth Success: User ${userId}`);
                    socket.user = decoded;
                    next();
                } catch (err: any) {
                    logger.warn(`🔌 Socket Auth Verification Failed: ${err.message}`);
                    next(new Error('Authentication error: Invalid token'));
                }
            } catch (error: any) {
                logger.error('🔌 Socket Auth Unexpected Error:', error);
                next(new Error('Authentication error'));
            }
        });
    }

    /**
     * Handle socket connection events
     */
    private setupConnectionHandler(): void {
        this.io.on('connection', (socket: AuthenticatedSocket) => {
            const userId = socket.user?.user_id || socket.user?.id;

            if (!userId) {
                logger.warn('🔌 Socket connected but no user ID found, disconnecting');
                socket.disconnect(true);
                return;
            }

            // Enforce connection limit per user
            this.enforceConnectionLimit(userId);

            // Register socket
            this.addUserSocket(userId, socket.id);
            socket.join(`user_${userId}`);

            logger.info(`🔌 User connected: ${userId} (Socket ID: ${socket.id})`);

            // Custom health check event for debugging
            socket.on('ping_check', (callback) => {
                if (typeof callback === 'function') {
                    callback({ status: 'ok', timestamp: Date.now() });
                }
            });

            // Handle disconnect
            socket.on('disconnect', (reason) => {
                this.removeUserSocket(userId, socket.id);
                logger.info(`🔌 User disconnected: ${userId} (Reason: ${reason})`);
            });

            // Handle errors
            socket.on('error', (error) => {
                logger.error(`🔌 Socket error for user ${userId}:`, error);
            });
        });

        // Server-level error handling
        this.io.on('connect_error', (error) => {
            logger.error('🔌 Socket.IO connection error:', error);
        });
    }

    /**
     * Enforce maximum sockets per user
     */
    private enforceConnectionLimit(userId: number): void {
        const existingSockets = this.userSockets.get(userId) || [];

        while (existingSockets.length >= SOCKET_CONFIG.maxSocketsPerUser) {
            const oldestSocketId = existingSockets.shift();
            if (oldestSocketId) {
                const oldSocket = this.io.sockets.sockets.get(oldestSocketId);
                if (oldSocket) {
                    logger.info(`🔌 Disconnecting old socket for user ${userId} (limit reached)`);
                    oldSocket.disconnect(true);
                }
            }
        }
    }

    /**
     * Setup PostgreSQL LISTEN/NOTIFY with auto-reconnection
     */
    private async setupDatabaseListener(): Promise<void> {
        try {
            await this.connectDatabaseListener();
        } catch (error) {
            logger.error('❌ Initial Database Listener connection failed:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Connect to PostgreSQL for LISTEN
     */
    private async connectDatabaseListener(): Promise<void> {
        // Clean up existing client if any
        if (this.pgClient) {
            try {
                await this.pgClient.end();
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        this.pgClient = new Client({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: Number(process.env.DB_PORT) || 5432,
            ssl: this.shouldUseSSL() ? { rejectUnauthorized: false } : false
        });

        await this.pgClient.connect();
        await this.pgClient.query('LISTEN notification_created');

        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0;
        logger.info('✅ PostgreSQL Listener Connected');

        // Handle notifications
        this.pgClient.on('notification', (msg) => {
            if (msg.channel === 'notification_created' && msg.payload) {
                try {
                    const payload: NotificationPayload = JSON.parse(msg.payload);
                    this.sendToUser(payload.user_id, 'new_notification', payload);
                    logger.debug(`📢 Notification sent to user ${payload.user_id}`);
                } catch (error) {
                    logger.error('❌ Error parsing notification payload:', error);
                }
            }
        });

        // Handle connection errors - trigger reconnect
        this.pgClient.on('error', (err) => {
            logger.error('❌ Database Listener Error:', err);
            if (!this.isShuttingDown) {
                this.scheduleReconnect();
            }
        });

        // Handle connection end
        this.pgClient.on('end', () => {
            logger.warn('⚠️ Database Listener connection ended');
            if (!this.isShuttingDown) {
                this.scheduleReconnect();
            }
        });
    }

    /**
     * Determine if SSL should be used for PostgreSQL
     */
    private shouldUseSSL(): boolean {
        const host = process.env.DB_HOST || '';
        return host !== 'localhost' && host !== '127.0.0.1';
    }

    /**
     * Schedule database reconnection with exponential backoff
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimeout || this.isShuttingDown) {
            return;
        }

        if (this.reconnectAttempts >= SOCKET_CONFIG.maxReconnectAttempts) {
            logger.error(`❌ Max reconnection attempts (${SOCKET_CONFIG.maxReconnectAttempts}) reached. Giving up.`);
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            SOCKET_CONFIG.initialReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            SOCKET_CONFIG.maxReconnectDelay
        );

        logger.info(`🔄 Scheduling DB reconnection attempt ${this.reconnectAttempts}/${SOCKET_CONFIG.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;
            try {
                await this.connectDatabaseListener();
            } catch (error) {
                logger.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
                this.scheduleReconnect();
            }
        }, delay);
    }

    /**
     * Add a socket ID to a user's socket list
     */
    private addUserSocket(userId: number, socketId: string): void {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, []);
        }
        this.userSockets.get(userId)!.push(socketId);
    }

    /**
     * Remove a socket ID from a user's socket list
     */
    private removeUserSocket(userId: number, socketId: string): void {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            const index = sockets.indexOf(socketId);
            if (index !== -1) {
                sockets.splice(index, 1);
            }
            if (sockets.length === 0) {
                this.userSockets.delete(userId);
            }
        }
    }

    /**
     * Gracefully close all socket connections and database listener
     */
    public async close(): Promise<void> {
        this.isShuttingDown = true;

        // Clear any pending reconnect
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        try {
            if (this.io) {
                // Notify all clients before closing
                this.io.emit('server_shutdown', { message: 'Server is shutting down' });
                this.io.close();
            }
            if (this.pgClient) {
                await this.pgClient.end();
            }
            logger.info('🛑 Socket Server and DB Listener Closed');
        } catch (error) {
            logger.error('❌ Error closing Socket Service:', error);
        }
    }

    /**
     * Send an event to a specific user's room
     */
    public sendToUser(userId: number, event: string, data: any): void {
        this.io.to(`user_${userId}`).emit(event, data);
    }

    /**
     * Broadcast an event to all connected clients
     */
    public broadcast(event: string, data: any): void {
        this.io.emit(event, data);
    }

    /**
     * Get the count of connected sockets for a user
     */
    public getUserSocketCount(userId: number): number {
        return this.userSockets.get(userId)?.length || 0;
    }

    /**
     * Get total connected sockets count
     */
    public getTotalConnections(): number {
        return this.io?.sockets?.sockets?.size || 0;
    }

    /**
     * Check if a user is currently connected
     */
    public isUserConnected(userId: number): boolean {
        return (this.userSockets.get(userId)?.length || 0) > 0;
    }
}

export default new SocketService();
