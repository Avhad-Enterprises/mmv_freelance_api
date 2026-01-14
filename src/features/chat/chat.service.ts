import DB from '../../../database/index';
import { T } from '../../../database/index';
import HttpException from '../../exceptions/HttpException';

class ChatService {
    public async createConversation(participant1Id: number, participant2Id: number) {
        // Ensure consistent ordering to prevent duplicate conversations
        const [user1, user2] = participant1Id < participant2Id
            ? [participant1Id, participant2Id]
            : [participant2Id, participant1Id];

        const existingFunc = async () => await DB(T.CONVERSATIONS_TABLE)
            .where({ participant1_id: user1, participant2_id: user2 })
            .first();

        const existing = await existingFunc();
        if (existing) {
            // Return existing conversation with full details
            return this.getConversationById(existing.id, participant1Id);
        }

        const [newConv] = await DB(T.CONVERSATIONS_TABLE)
            .insert({
                participant1_id: user1,
                participant2_id: user2,
            })
            .returning('*');

        // Return new conversation with full details
        return this.getConversationById(newConv.id, participant1Id);
    }

    public async getConversationById(conversationId: number, currentUserId: number) {
        const conversation = await DB(T.CONVERSATIONS_TABLE)
            .where('id', conversationId)
            .first();

        if (!conversation) {
            throw new HttpException(404, 'Conversation not found');
        }

        // Get participant details
        const participants = await DB(T.USERS_TABLE)
            .select('user_id', 'first_name', 'last_name', 'email', 'profile_picture')
            .whereIn('user_id', [conversation.participant1_id, conversation.participant2_id]);

        // Get last message
        const lastMessage = await DB(T.MESSAGES_TABLE)
            .where('conversation_id', conversationId)
            .orderBy('created_at', 'desc')
            .first();

        // Get unread count for current user
        const unreadCount = await DB(T.MESSAGES_TABLE)
            .where({
                conversation_id: conversationId,
                receiver_id: currentUserId,
                is_read: false
            })
            .count('* as count')
            .first();

        return {
            conversation_id: conversation.id,
            participant1_id: conversation.participant1_id,
            participant2_id: conversation.participant2_id,
            participants: participants,
            last_message_content: lastMessage?.content || null,
            last_message_sender_id: lastMessage?.sender_id || null,
            last_message_created_at: lastMessage?.created_at || null,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at || conversation.created_at,
            unread_count: parseInt(unreadCount?.count as string) || 0
        };
    }

    public async getConversations(userId: number) {
        // Get all conversations where user is a participant
        const conversations = await DB(T.CONVERSATIONS_TABLE)
            .where('participant1_id', userId)
            .orWhere('participant2_id', userId)
            .orderBy('last_message_at', 'desc');

        // Enrich each conversation with participant details, last message, and unread count
        const enriched = await Promise.all(conversations.map(async (conv) => {
            // Get participant details
            const participants = await DB(T.USERS_TABLE)
                .select('user_id', 'first_name', 'last_name', 'email', 'profile_picture')
                .whereIn('user_id', [conv.participant1_id, conv.participant2_id]);

            // Get last message
            const lastMessage = await DB(T.MESSAGES_TABLE)
                .where('conversation_id', conv.id)
                .orderBy('created_at', 'desc')
                .first();

            // Get unread count for this user
            const unreadCount = await DB(T.MESSAGES_TABLE)
                .where({
                    conversation_id: conv.id,
                    receiver_id: userId,
                    is_read: false
                })
                .count('* as count')
                .first();

            return {
                conversation_id: conv.id,
                participant1_id: conv.participant1_id,
                participant2_id: conv.participant2_id,
                participants: participants,
                last_message_content: lastMessage?.content || null,
                last_message_sender_id: lastMessage?.sender_id || null,
                last_message_created_at: lastMessage?.created_at || null,
                created_at: conv.created_at,
                updated_at: conv.updated_at || conv.created_at,
                unread_count: parseInt(unreadCount?.count as string) || 0
            };
        }));

        return enriched;
    }

    public async getMessages(conversationId: number, limit = 50, offset = 0) {
        // Verify conversation exists
        const conversation = await DB(T.CONVERSATIONS_TABLE)
            .where('id', conversationId)
            .first();

        if (!conversation) {
            throw new HttpException(404, 'Conversation not found');
        }

        return await DB(T.MESSAGES_TABLE)
            .where({ conversation_id: conversationId })
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);
    }

    public async createMessage(senderId: number, conversationId: number, content: string) {
        const conversation = await DB(T.CONVERSATIONS_TABLE).where('id', conversationId).first();
        if (!conversation) throw new HttpException(404, 'Conversation not found');

        const receiverId = conversation.participant1_id === senderId
            ? conversation.participant2_id
            : conversation.participant1_id;

        const trx = await DB.transaction();

        try {
            const [message] = await trx(T.MESSAGES_TABLE)
                .insert({
                    conversation_id: conversationId,
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content,
                })
                .returning('*');

            await trx(T.CONVERSATIONS_TABLE)
                .where('id', conversationId)
                .update({
                    last_message_text: content,
                    last_message_at: new Date(),
                });

            await trx.commit();
            return message;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    public async markMessagesAsRead(conversationId: number, userId: number) {
        await DB(T.MESSAGES_TABLE)
            .where({ conversation_id: conversationId, receiver_id: userId, is_read: false })
            .update({ is_read: true, read_at: new Date() });
    }
}

export default new ChatService();
