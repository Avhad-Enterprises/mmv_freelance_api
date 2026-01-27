import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Client } from 'pg'; // Use pg client directly for LISTEN/NOTIFY
import { verify } from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface NotificationPayload {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    created_at: string;
}

class SocketService {
    private io: SocketIOServer;
    private pgClient: Client;
    private userSockets: Map<number, string[]> = new Map(); // Map user_id to array of socket_ids

    constructor() {
        this.userSockets = new Map();
    }

    public init(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*", // Configure as needed for production
                methods: ["GET", "POST"]
            },
            path: '/socket.io'
        });

        this.setupMiddleware();
        this.setupConnectionHandler();
        this.setupDatabaseListener();

        logger.info('✅ Socket Server Initialized');
    }

    private setupMiddleware() {
        this.io.use((socket: Socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

                if (!token) {
                    return next(new Error('Authentication error'));
                }

                // Remove Bearer prefix if present
                const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

                let secretKey = process.env.JWT_SECRET || process.env.SECRET_KEY;

                if (!secretKey) {
                    if (process.env.NODE_ENV === 'production') {
                        throw new Error('FATAL: JWT_SECRET is not defined in production environment!');
                    }
                    console.warn('⚠️ WARNING: Using fallback JWT secret for Socket. Set JWT_SECRET in .env file.');
                    secretKey = 'fallback-secret';
                }

                try {
                    const decoded: any = verify(tokenString, secretKey);
                    (socket as any).user = decoded; // Attach user to socket
                    next();
                } catch (err) {
                    console.error(`❌ Socket Auth Verification Failed: ${err.message}`);
                    next(new Error('Authentication error'));
                }
            } catch (error) {
                console.error('❌ Socket Auth Unexpected Error:', error);
                next(new Error('Authentication error'));
            }
        });
    }

    private setupConnectionHandler() {
        this.io.on('connection', (socket: Socket) => {
            const userId = (socket as any).user?.user_id || (socket as any).user?.id;

            if (userId) {
                this.addUserSocket(userId, socket.id);
                socket.join(`user_${userId}`); // Join a room for easier broadcasting

                logger.info(`🔌 User connected: ${userId} (Socket ID: ${socket.id})`);

                // Chat Events
                socket.on('join_conversation', (conversationId) => {
                    socket.join(`conversation_${conversationId}`);
                    // logger.info(`User ${userId} joined conversation ${conversationId}`);
                });

                socket.on('leave_conversation', (conversationId) => {
                    socket.leave(`conversation_${conversationId}`);
                });

                socket.on('typing_start', ({ conversationId, toUserId }) => {
                    this.io.to(`conversation_${conversationId}`).emit('typing_start', {
                        conversationId,
                        userId
                    });
                });

                socket.on('typing_stop', ({ conversationId, toUserId }) => {
                    this.io.to(`conversation_${conversationId}`).emit('typing_stop', {
                        conversationId,
                        userId
                    });
                });

                socket.on('send_message', async (data) => {
                    try {
                        const { conversationId, content, toUserId } = data;

                        // Ensure conversationId is a number
                        const convId = typeof conversationId === 'string' ? parseInt(conversationId) : conversationId;

                        // Save to DB
                        const ChatService = (await import('../features/chat/chat.service')).default;
                        const message = await ChatService.createMessage(userId, convId, content);

                        // Broadcast to conversation room (includes sender for confirmation)
                        this.io.to(`conversation_${convId}`).emit('new_message', message);

                        // Also notify recipient globally if they are online but not in the conversation room
                        this.io.to(`user_${toUserId}`).emit('message_notification', {
                            ...message,
                            type: 'new_message'
                        });

                    } catch (error) {
                        console.error('Error sending message:', error);
                        socket.emit('error', { message: 'Failed to send message' });
                    }
                });

                socket.on('mark_read', async ({ conversationId }) => {
                    try {
                        // Ensure conversationId is a number
                        const convId = typeof conversationId === 'string' ? parseInt(conversationId) : conversationId;

                        const ChatService = (await import('../features/chat/chat.service')).default;
                        await ChatService.markMessagesAsRead(convId, userId);

                        // Notify others in conversation that messages were read
                        this.io.to(`conversation_${convId}`).emit('messages_read', {
                            conversationId: convId,
                            userId,
                            readAt: new Date()
                        });
                    } catch (error) {
                        console.error('Error marking read:', error);
                    }
                });

                socket.on('disconnect', () => {
                    this.removeUserSocket(userId, socket.id);
                    logger.info(`🔌 User disconnected: ${userId}`);
                });
            }
        });
    }

    private async setupDatabaseListener() {
        try {
            // Create a dedicated client for LISTEN
            this.pgClient = new Client({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                port: Number(process.env.DB_PORT) || 5432,
                ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
            });

            await this.pgClient.connect();
            await this.pgClient.query('LISTEN notification_created');

            logger.info('✅ PostgreSQL Listener Connected');

            this.pgClient.on('notification', (msg) => {
                if (msg.channel === 'notification_created' && msg.payload) {
                    try {
                        const payload: NotificationPayload = JSON.parse(msg.payload);
                        this.sendToUser(payload.user_id, 'new_notification', payload);
                    } catch (error) {
                        logger.error('❌ Error parsing notification payload:', error);
                    }
                }
            });

            this.pgClient.on('error', (err) => {
                logger.error('❌ Database Listener Error:', err);
                // Reconnection logic could go here
            });

        } catch (error) {
            logger.error('❌ Failed to connect Database Listener:', error);
        }
    }

    private addUserSocket(userId: number, socketId: string) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, []);
        }
        this.userSockets.get(userId)?.push(socketId);
    }

    private removeUserSocket(userId: number, socketId: string) {
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

    public async close() {
        try {
            if (this.io) {
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

    public sendToUser(userId: number, event: string, data: any) {
        // Broadcast to the user's room
        this.io.to(`user_${userId}`).emit(event, data);
        // logger.info(`📢 Notification sent to user ${userId}`);
    }
}

export default new SocketService();
