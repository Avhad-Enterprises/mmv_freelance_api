import { Response } from 'express';

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

export class ResponseUtil {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static getMeta(requestId?: string) {
    return {
      timestamp: this.getTimestamp(),
      version: 'v1',
      requestId: requestId || undefined
    };
  }

  // Success responses
  static success<T>(
    res: Response, 
    data: T, 
    message: string = 'Operation successful',
    statusCode: number = 200,
    requestId?: string
  ): Response {
    const response: StandardResponse<T> = {
      success: true,
      message,
      data,
      meta: this.getMeta(requestId)
    };

    return res.status(statusCode).json(response);
  }

  // Created response (201)
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
    requestId?: string
  ): Response {
    return this.success(res, data, message, 201, requestId);
  }

  // Error responses
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: string[],
    requestId?: string
  ): Response {
    const response: StandardResponse = {
      success: false,
      message,
      errors,
      meta: this.getMeta(requestId)
    };

    return res.status(statusCode).json(response);
  }

  // Validation error (400)
  static validationError(
    res: Response,
    message: string = 'Validation failed',
    errors: string[] = [],
    requestId?: string
  ): Response {
    return this.error(res, message, 400, errors, requestId);
  }

  // Unauthorized (401)
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access',
    requestId?: string
  ): Response {
    return this.error(res, message, 401, undefined, requestId);
  }

  // Forbidden (403)
  static forbidden(
    res: Response,
    message: string = 'Access forbidden',
    requestId?: string
  ): Response {
    return this.error(res, message, 403, undefined, requestId);
  }

  // Not found (404)
  static notFound(
    res: Response,
    message: string = 'Resource not found',
    requestId?: string
  ): Response {
    return this.error(res, message, 404, undefined, requestId);
  }

  // Conflict (409)
  static conflict(
    res: Response,
    message: string = 'Resource already exists',
    requestId?: string
  ): Response {
    return this.error(res, message, 409, undefined, requestId);
  }

  // Internal server error (500)
  static internalError(
    res: Response,
    message: string = 'Internal server error',
    requestId?: string
  ): Response {
    return this.error(res, message, 500, undefined, requestId);
  }
}

// Type definitions for common response data structures
export interface UserRegistrationResponse {
  user: {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    account_type: 'freelancer' | 'client';
    phone_verified: boolean;
    email_verified: boolean;
    is_active: boolean;
    created_at: Date;
  };
  token: string;
  redirectUrl?: string;
}

export interface UserLoginResponse {
  user: {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    account_type: 'freelancer' | 'client';
    profile_picture?: string;
    last_login_at?: Date;
  };
  token: string;
  redirectUrl: string;
}