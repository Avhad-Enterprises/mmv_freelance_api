import { Router } from 'express';
import ChatController from './chat.controller';
import Route from '../../interfaces/routes.interface';
import authMiddleware from '../../middlewares/auth.middleware';

class ChatRoute implements Route {
    public path = '/chat';
    public router = Router();
    public chatController = new ChatController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/conversations`, authMiddleware, this.chatController.getConversations);
        this.router.post(`${this.path}/conversations`, authMiddleware, this.chatController.createConversation);
        this.router.get(`${this.path}/conversations/:id/messages`, authMiddleware, this.chatController.getMessages);
    }
}

export default ChatRoute;
