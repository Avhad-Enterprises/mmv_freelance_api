import DB from "../../../database/index.schema";
import { NotificationDto } from "./notification.dto";
import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../../interfaces/auth.interface";
import NotificationService from "./notification.service";
import HttpException from "../../exceptions/HttpException";

class NotificationController {
    public NotificationService = new NotificationService();
    public getnotificationby = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const notification = await this.NotificationService.getnotificationbysystem(user_id);
            res.status(200).json({ data: notification, success: true });
        } catch (err) {
            next(err);
        }
    }

    public notificationisread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const id = parseInt(req.params.id);
        if (!id) {
            throw new HttpException(400, " Id is required");
        }
        try {
            const notification = await this.NotificationService.markAsRead(id);
            if (!notification) {
                throw new HttpException(404, "Notification not found");
            }

            res.status(200).json({
                message: `Notification ${id} marked as read successfully`,
                data: notification,
            });
        } catch (error) {
            next(error);
        }
    };

    public readallnotification = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.user_id;

            const updatedNotifications = await this.NotificationService.markallasread(userId);
            if (!updatedNotifications) {
                throw new HttpException(404, "Notification not found");
            }
            res.status(200).json({
                message: `${updatedNotifications} notifications marked as read`,
                data: updatedNotifications,
            });
            return;

        } catch (error) {
            next(error);
        }
    };

    public notificationcount = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user_id = req.user.user_id;
     
            const notification = await this.NotificationService.getUnreadCount(user_id)

            if (!notification) {
                throw new HttpException(404, "Notification not found");
            }
            res.status(200).json({
                message: `Unread Notification of ${user_id} count fetched successfully`,
                data: notification,
            });
        } catch (error) {
            next(error);
        }
    };
}
export default NotificationController;

