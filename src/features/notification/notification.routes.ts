import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import notificationController from './notification.controller';
import { NotificationDto } from './notification.dto';

class notificationRoute implements Route {

    public path = '/notification';
    public router = Router();
    public notificationController = new notificationController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post(`${this.path}/getnotification`, (req, res, next) => this.notificationController.getnotificationby(req, res, next));

        this.router.get(`${this.path}/read/:id`, (req, res, next) => this.notificationController.notificationisread(req, res, next));

        this.router.post(`${this.path}/read-all`, (req, res, next) => this.notificationController.readallnotification(req, res, next));

        this.router.get(`${this.path}/count/:id`, (req, res, next) => this.notificationController.notificationcount(req, res, next));

    }
}

export default notificationRoute;