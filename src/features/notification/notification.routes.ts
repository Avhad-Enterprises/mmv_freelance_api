import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import notificationController from './notification.controller';
import validationMiddleware from '../../middlewares/validation.middleware';
import { NotificationDto } from './notification.dto';
import { requireRole } from '../../middlewares/role.middleware';
import authMiddleware from '../../middlewares/auth.middleware';

class notificationRoute implements Route {

    public path = '/notification';
    public router = Router();
    public notificationController = new notificationController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // ✅ Personal operation - get authenticated user's notifications
        this.router.get(`${this.path}/my-notifications`, authMiddleware, (req, res, next) => {
            this.notificationController.getnotificationby(req as any, res, next);
        });

        // ✅ Admin operation - mark specific notification as read (keeps existing pattern)
        this.router.get(`${this.path}/read/:id`, authMiddleware, (req, res, next) => {
            this.notificationController.notificationisread(req, res, next);
        });

        // ✅ Personal operation - mark all authenticated user's notifications as read  
        this.router.post(`${this.path}/read-all`, authMiddleware, (req, res, next) => {
            this.notificationController.readallnotification(req as any, res, next);
        });

        // ✅ Personal operation - create a notification (admin or system)
        this.router.post(`${this.path}/create`, authMiddleware, validationMiddleware(NotificationDto, 'body', false, []), (req, res, next) => {
            this.notificationController.createnotification(req as any, res, next);
        });

        // ✅ Personal operation - delete a notification (user or admin)
        this.router.delete(`${this.path}/:id`, authMiddleware, (req, res, next) => {
            this.notificationController.deletenotification(req, res, next);
        });

        // ✅ Personal operation - get authenticated user's notification count
        this.router.get(`${this.path}/my-count`, authMiddleware, (req, res, next) => {
            this.notificationController.notificationcount(req as any, res, next);
        });

    }
}

export default notificationRoute;