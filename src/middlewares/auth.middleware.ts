import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import DB from '../../database/index.schema';
import { IsEmpty } from 'class-validator';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {

  try {

    if (req.path.includes('/users/login') || req.path.includes('/users/insert_user') || req.path.includes('/projectsTask/getallprojectlisting') || req.path.includes('/users/loginf')) {
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
          await DB.raw("SET search_path TO public");
          next();
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