import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import { logger } from '../utils/logger';
import { ResponseUtil } from '../utils/response.util';

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

    // Use standardized error response
    ResponseUtil.error(res, message, status);
    
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
