import { NotificationDto } from "./notification.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { NOTIFICATION } from "../../../database/notification.schema";

class NotificationService {
    public async getnotificationbysystem(user_id: number): Promise<any> {
        try {
            if (!user_id) {
                throw new HttpException(400, "User ID is required");
            }
            // Return all notifications for the user (keep default behaviour for unread filtering in controller if needed)
            const result = await DB(T.NOTIFICATION)
                .where({ user_id })
                .select("*")
                .orderBy('created_at', 'desc');
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
                updated_at: new Date(),
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
                is_read: true,
                read_at: new Date(),
                updated_at: new Date(),
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
    
    public async createNotification(dto: NotificationDto): Promise<any> {
        if (isEmpty(dto)) {
            throw new HttpException(400, 'Data Invalid');
        }

        const insert = await DB(T.NOTIFICATION)
            .insert({
                user_id: dto.user_id,
                title: dto.title,
                message: dto.message,
                type: dto.type,
                related_id: dto.related_id || null,
                related_type: dto.related_type || null,
                redirect_url: dto.redirect_url || null,
                meta: dto.meta || null,
                is_read: dto.is_read ?? false,
                read_at: dto.read_at ? new Date(dto.read_at) : null,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning('*');

        return insert[0];
    }

    public async deleteNotification(id: number): Promise<void> {
        if (!id) {
            throw new HttpException(400, 'ID is required');
        }
        const existing = await DB(T.NOTIFICATION).where({ id }).first();
        if (!existing) {
            throw new HttpException(404, 'Notification not found');
        }
        await DB(T.NOTIFICATION).where({ id }).del();
        return;
    }
}
export default NotificationService;