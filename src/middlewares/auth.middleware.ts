import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import DB, { T } from '../../database/index.schema';
import { IsEmpty } from 'class-validator';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {

  try {

    if (req.path.includes('/users/login') || 
        req.path.includes('/users/insert_user') || 
        req.path.includes('/projectsTask/getallprojectlisting') || 
        req.path.includes('/users/loginf') ||
        req.path.includes('/auth/register') ||
        req.path.includes('/auth/login') ||
        req.path.includes('/health') ||
        req.path.includes('/users/get_user_by_id') ||
        req.path.includes('/users/get_freelancer_by_id') ||
        req.path.includes('/users/get_client_by_id') ||
        req.path.includes('/users/get_admin_by_id') ||
        req.path.includes('/applications/my-applications') ||
        req.path.includes('/applications/count/')) {
      console.log(DB)
      await DB.raw("SET search_path TO public");
      return next();
    }

    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      
      const bearerToken = bearer[1];
      if (bearerToken != 'null') {
        
        const secret = process.env.JWT_SECRET;
        
        const verificationResponse = (await jwt.verify(bearerToken, secret)) as DataStoredInToken;
       
        if (verificationResponse) {
          const userId = verificationResponse.id;
          const findUser = await DB(T.USERS_TABLE).where({ user_id: userId }).first();
          
          if (findUser) {
            req.user = findUser;
            await DB.raw("SET search_path TO public");
            next();
          } else {
            next(new HttpException(401, 'Invalid authentication token'));
          }
        }
        else { next(new HttpException(401, 'UnAuthorized User')); }
      } else {
        next(new HttpException(404, 'Authentication token missing'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }

  } catch (error) {
    next(new HttpException(401, 'Auth Middleware Exception Occured'));
  }
};

export default authMiddleware;