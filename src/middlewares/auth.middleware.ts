import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import DB, { T } from '../../database/index';
import { IsEmpty } from 'class-validator';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {

  try {

    // Public routes that don't require authentication
    const publicRoutes = [
      '/users/password-reset-request',
      '/users/password-reset',
      '/auth/login',
      '/auth/register/client',
      '/auth/register/videographer',
      '/auth/register/videoeditor',
      '/admin/invites/accept',
      '/health',
      '/projectsTask/getallprojectlisting',
      '/projects-tasks/listings',
      '/freelancers/getfreelancers',
      '/category/getallcategorys',
      '/category/getcategorytypes',
      '/skills',
      '/tags'
    ];

    // Check if the current path matches any public route
    const isPublicRoute = publicRoutes.some(route => req.path.includes(route));
    
    if (isPublicRoute) {
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
        next(new HttpException(401, 'Authentication token missing'));
      }
    } else {
      next(new HttpException(401, 'Authentication token missing'));
    }

  } catch (error) {
    next(new HttpException(401, 'Auth Middleware Exception Occured'));
  }
};

export default authMiddleware;