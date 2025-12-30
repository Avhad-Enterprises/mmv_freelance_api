import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import { logger } from '../utils/logger';
import { ResponseUtil } from '../utils/response.util';
import SystemLogService from '../features/system-log/system-log.service';
import { RequestWithUser } from '../interfaces/auth.interface';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction): void => {

  try {

    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    logger.error(`StatusCode : ${status}, Message : ${message}`, {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Log to Database (Async, don't await to not block response)
    const userId = (req as RequestWithUser).user ? (req as RequestWithUser).user.user_id : null;

    SystemLogService.logError({
      statusCode: status,
      method: req.method,
      path: req.originalUrl,
      message: message,
      stackTrace: error.stack,
      userId: userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metaData: {
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined, // Be careful with sensitive data in body
        params: req.params,
        headers: {
          referer: req.get('Referer'),
          origin: req.get('Origin')
        }
      }
    });


    // Use standardized error response
    ResponseUtil.error(res, message, status);

  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
