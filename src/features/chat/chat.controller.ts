import { NextFunction, Request, Response } from 'express';
import ChatService from './chat.service';
import { RequestWithUser } from '../../interfaces/auth.interface';

class ChatController {
    public createConversation = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.user_id;
            const { otherUserId } = req.body;
            const conversation = await ChatService.createConversation(userId, Number(otherUserId));
            res.status(201).json({ success: true, data: conversation, message: 'Conversation created' });
        } catch (error) {
            next(error);
        }
    };

    public getConversations = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.user_id;
            const conversations = await ChatService.getConversations(userId);
            res.status(200).json({ success: true, data: conversations, message: 'Conversations retrieved' });
        } catch (error) {
            next(error);
        }
    };

    public getMessages = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const conversationId = Number(req.params.id);
            const limit = Number(req.query.limit) || 50;
            const offset = Number(req.query.offset) || 0;

            const messages = await ChatService.getMessages(conversationId, limit, offset);
            res.status(200).json({ success: true, data: messages, message: 'Messages retrieved' });
        } catch (error) {
            next(error);
        }
    };
}

export default ChatController;
