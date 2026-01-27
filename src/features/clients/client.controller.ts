// Client Controller - Handles client-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import ClientService from './client.service';
import UserService from '../user/user.service';
import { ClientProfileUpdateDto } from './client.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';
import HttpException from '../../exceptions/HttpException';

/**
 * Client Controller
 * Handles all client-specific endpoints
 */
export class ClientController {
  private clientService = new ClientService();
  private userService = new UserService();

  /**
   * Get current client's profile
   * GET /api/v1/clients/profile
   */
  public getMyProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.clientService.getClientProfile(req.user.user_id);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get client by ID (admin/public)
   * GET /api/v1/clients/:id
   */
  public getClientById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const clientId = parseInt(req.params.id as string);
      const profile = await this.clientService.getClientProfile(clientId);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all clients (admin only)
   * GET /api/v1/clients
   */
  public getAllClients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const clients = await this.clientService.getAllClients();

      res.status(200).json({
        success: true,
        count: clients.length,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update client profile (unified - handles both user and client profile fields)
   * PATCH /api/v1/clients/profile
   */
  public updateProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData: ClientProfileUpdateDto = req.body;

      // Separate user fields from profile fields
      const userFields = {
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        username: updateData.username,
        email: updateData.email,
        phone_number: updateData.phone_number,
        phone_verified: updateData.phone_verified,
        email_verified: updateData.email_verified,
        profile_picture: updateData.profile_picture,
        bio: updateData.bio,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        country: updateData.country,
        pincode: updateData.pincode,
        email_notifications: updateData.email_notifications
      };

      const profileFields = {
        company_name: updateData.company_name,
        industry: updateData.industry,
        website: updateData.website,
        social_links: updateData.social_links,
        company_size: updateData.company_size,
        required_services: updateData.required_services,
        required_skills: updateData.required_skills,
        required_editor_proficiencies: updateData.required_editor_proficiencies,
        required_videographer_proficiencies: updateData.required_videographer_proficiencies,
        budget_min: updateData.budget_min,
        budget_max: updateData.budget_max,
        tax_id: updateData.tax_id,
        business_document_urls: updateData.business_document_urls,
        work_arrangement: updateData.work_arrangement,
        project_frequency: updateData.project_frequency,
        hiring_preferences: updateData.hiring_preferences,
        payment_method: updateData.payment_method,
        bank_account_info: updateData.bank_account_info
      };

      // Update user table fields if any are provided
      const hasUserFields = Object.values(userFields).some(value => value !== undefined);
      if (hasUserFields) {
        await this.userService.updateBasicInfo(req.user.user_id, userFields);
      }

      // Update client profile fields if any are provided
      const hasProfileFields = Object.values(profileFields).some(value => value !== undefined);
      if (hasProfileFields) {
        await this.clientService.updateClientProfile(req.user.user_id, profileFields);
      }

      // Get updated profile
      const updatedProfile = await this.clientService.getClientProfile(req.user.user_id);

      res.status(200).json({
        success: true,
        message: 'Client profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get client statistics
   * GET /api/v1/clients/profile/stats
   */
  public getStats = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.clientService.getClientStats(req.user.user_id);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete client account (soft delete)
   * DELETE /api/v1/clients/profile
   */
  public deleteAccount = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.clientService.softDelete(req.user.user_id);

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
