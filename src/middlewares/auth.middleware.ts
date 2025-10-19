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
      '/auth/register',
      '/auth/register/client',
      '/auth/register/videographer',
      '/auth/register/videoeditor',
      '/admin/invites/accept',
      '/health',
      '/projects-tasks/listings',
      '/freelancers/getfreelancers',
      '/freelancers/getfreelancers-public',  // GET /freelancers/getfreelancers-public (public-safe)
      '/categories',  // GET /categories (read-only)
      '/categories/by-type',  // GET /categories/by-type (read-only)
      '/skills',
      '/tags',
      '/blog/getallblogs'
    ];

    // Check if the current path matches any public route
    // GET requests to public routes don't require auth
    // POST requests to registration and login routes don't require auth
    const isPublicGetRoute = publicRoutes.some(route => req.path.includes(route)) && req.method === 'GET';
    const isPublicRegistrationRoute = req.path.includes('/auth/register') && req.method === 'POST';
    const isPublicLoginRoute = req.path.includes('/auth/login') && req.method === 'POST';
    
    if (isPublicGetRoute || isPublicRegistrationRoute || isPublicLoginRoute) {
      await DB.raw("SET search_path TO public");
      return next();
    }

    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      
      const bearerToken = bearer[1];
      if (bearerToken != 'null') {
        
        const secret = process.env.JWT_SECRET;
        
        const verificationResponse = (await jwt.verify(bearerToken, secret)) as any;
       
        if (verificationResponse) {
          const userId = verificationResponse.id;
          const findUser = await DB(T.USERS_TABLE).where({ user_id: userId }).first();
          
          if (findUser) {
            req.user = findUser;
            
            // Fetch user roles from database
            const userRoles = await DB('user_roles')
              .join('role', 'user_roles.role_id', 'role.role_id')
              .where('user_roles.user_id', userId)
              .select('role.name');
            
            // Attach roles to user object
            req.user.roles = userRoles.map(r => r.name);
            
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