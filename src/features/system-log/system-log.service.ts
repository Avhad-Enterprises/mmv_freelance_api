import DB, { T } from '../../../database';
import { logger } from '../../utils/logger';

export interface SystemErrorLog {
    statusCode: number;
    method: string;
    path: string;
    message: string;
    stackTrace?: string;
    userId?: number;
    ipAddress?: string;
    userAgent?: string;
    metaData?: any;
}

class SystemLogService {
    public async logError(data: SystemErrorLog): Promise<void> {
        try {
            await DB(T.SYSTEM_ERROR_LOGS).insert({
                status_code: data.statusCode,
                method: data.method,
                path: data.path,
                message: data.message,
                stack_trace: data.stackTrace,
                user_id: data.userId,
                ip_address: data.ipAddress,
                user_agent: data.userAgent,
                meta_data: data.metaData
            });
        } catch (error) {
            // If logging to DB fails, fallback to file logger to not lose the error
            logger.error('Failed to write to system_error_logs:', error);
        }
    }
}

export default new SystemLogService();
