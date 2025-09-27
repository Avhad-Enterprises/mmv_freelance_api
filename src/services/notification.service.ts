import { NotificationDto } from "../dtos/notification.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { NOTIFICATION } from "../database/notification.schema";

class NotificationService {
    public async getnotificationbysystem(user_id: number): Promise<any> {
        try {
            if (!user_id) {
                throw new HttpException(400, "User ID is required");
            }
            const result = await DB(T.NOTIFICATION)
                .where({ user_id, is_read: false })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching Notification');
        }
    }
    public async markAsRead(id: number): Promise<any> {
        if (!id) {
            throw new HttpException(400, " ID is required");
        }
        const notification = await DB(T.NOTIFICATION)
            .where({ id, is_read: false })
            .update({
                is_read: true,
                read_at: new Date(),
            })
            .returning("*");

        if (!notification || notification.length === 0) {
            throw new HttpException(400, " Notification is null");
        }
        return notification[0];
    }
    public async markallasread(userId: number): Promise<number> {
        if (!userId) {
            throw new HttpException(400, "User ID is required");
        }
        const result = await DB(T.NOTIFICATION)
            .where('user_id', userId)
            .update({
                is_read: false,
                read_at: new Date(),
            });

        if (!userId) {
            throw new HttpException(404, "Notification marked as read");

        }
        return result;
    }
    public async getUnreadCount(user_id: number): Promise<number> {
        if (!user_id) {
            throw new HttpException(400, "User ID is required");
        }
    
        const unreadCount = await DB(T.NOTIFICATION)
            .count('* as count')
            .where('user_id', user_id)
            .andWhere('is_read', false);
        const count = Number(unreadCount[0].count);
        if (isNaN(count)) {
            throw new HttpException(500, "Error converting unread count to number");
        }
        return count;
    }
}
export default NotificationService;