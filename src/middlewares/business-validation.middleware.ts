import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';
import DB from '../../database/index.schema';

/**
 * Backend business logic validation middleware
 * Focuses on database constraints and business rules that frontend cannot validate
 */
export class BusinessValidationMiddleware {

  /**
   * Check for duplicate email/username in database (Backend Critical)
   * Frontend cannot validate this without exposing user data
   */
  static checkDuplicateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, username } = req.body;

      if (email || username) {
        const query = DB('users').where(function() {
          if (email) this.where('email', email);
          if (username) this.orWhere('username', username);
        }).first();

        const existingUser = await query;

        if (existingUser) {
          const conflicts = [];
          if (existingUser.email === email) conflicts.push('Email already registered');
          if (existingUser.username === username) conflicts.push('Username already taken');
          
          ResponseUtil.validationError(
            res,
            'User already exists',
            conflicts
          );
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate file uploads for business requirements (Backend Critical)
   * File validation must be done server-side for security
   */
  static validateBusinessDocuments = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const files = req.files as any;
      const { account_type } = req.body;

      // Business logic: Freelancers need ID documents, business documents are optional for clients
      // (Business documents may be required later based on business type or verification level)
      
      if (account_type === 'freelancer') {
        if (!files?.id_document || files.id_document.length === 0) {
          ResponseUtil.validationError(
            res,
            'ID document required',
            ['Freelancer accounts must provide government-issued ID']
          );
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate account type business rules (Backend Critical)
   */
  static validateAccountTypeRules = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { account_type, company_name, business_type } = req.body;

      // Business rule: Client accounts must have company information
      if (account_type === 'client') {
        if (!company_name || company_name.trim().length === 0) {
          ResponseUtil.validationError(
            res,
            'Company information required',
            ['Client accounts must provide company name']
          );
          return;
        }

        // Validate required client fields
        const requiredClientFields = [
          'industry', 'company_size', 'required_services', 
          'required_skills', 'required_editor_proficiencies', 
          'required_videographer_proficiencies', 'budget_min', 'budget_max',
          'address', 'pincode', 'work_arrangement', 'project_frequency', 'hiring_preferences'
        ];

        const missingFields = requiredClientFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
          ResponseUtil.validationError(
            res,
            'Required client fields missing',
            missingFields.map(field => `${field} is required for client accounts`)
          );
          return;
        }
      }

      // Business rule: Freelancer accounts must have professional information
      if (account_type === 'freelancer') {
        const requiredFreelancerFields = [
          'profile_title', 'skills', 'experience_level', 'hourly_rate',
          'street_address', 'zip_code', 'id_type', 'availability', 
          'hours_per_week', 'work_type', 'languages'
        ];

        const missingFields = requiredFreelancerFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
          ResponseUtil.validationError(
            res,
            'Required freelancer fields missing',
            missingFields.map(field => `${field} is required for freelancer accounts`)
          );
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Backend-specific registration validation stack
   */
  static registrationValidation = [
    BusinessValidationMiddleware.checkDuplicateUser,
    BusinessValidationMiddleware.validateAccountTypeRules,
    BusinessValidationMiddleware.validateBusinessDocuments
  ];
}