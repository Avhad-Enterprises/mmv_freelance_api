import { Request } from 'express';
import { Users } from '../features/user/user.interface';

export interface DataStoredInToken {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: Users & {
    roles?: string[];
    permissions?: string[];
  };
}

