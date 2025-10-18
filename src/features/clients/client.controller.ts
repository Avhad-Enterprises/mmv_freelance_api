// Client Controller - Handles client-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import ClientService from './client.service';
import { ClientUpdateDto } from './client.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';
import HttpException from '../../exceptions/HttpException';

/**
 * Client Controller
 * Handles all client-specific endpoints
 */
export class ClientController {
  private clientService = new ClientService();

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
      const clientId = parseInt(req.params.id);
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
   * Update client profile
   * PATCH /api/v1/clients/profile
   */
  public updateProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData: ClientUpdateDto = req.body;
      
      // Update base user fields if provided
      const userFields = [
        'first_name', 'last_name', 'email', 'phone_number', 
        'profile_picture', 'bio', 'timezone', 'address_line_first',
        'address_line_second', 'city', 'state', 'country', 'pincode'
      ];
      
      const hasUserFields = Object.keys(updateData).some(key => userFields.includes(key));
      
      if (hasUserFields) {
        const userUpdateData: any = {};
        userFields.forEach(field => {
          if (updateData[field as keyof ClientUpdateDto] !== undefined) {
            userUpdateData[field] = updateData[field as keyof ClientUpdateDto];
          }
        });
        await this.clientService.updateBasicInfo(req.user.user_id, userUpdateData);
      }
      
      // Update client profile fields
      const profileFields = Object.keys(updateData).filter(key => !userFields.includes(key));
      if (profileFields.length > 0) {
        const profileData: any = {};
        profileFields.forEach(field => {
          profileData[field] = updateData[field as keyof ClientUpdateDto];
        });
        await this.clientService.updateClientProfile(req.user.user_id, profileData);
      }
      
      // Get updated profile
      const updatedProfile = await this.clientService.getClientProfile(req.user.user_id);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
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
   * Update business documents
   * PATCH /api/v1/clients/profile/documents
   */
  public updateDocuments = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { document_urls } = req.body;
      
      if (!Array.isArray(document_urls)) {
        throw new HttpException(400, 'document_urls must be an array');
      }
      
      await this.clientService.updateBusinessDocuments(req.user.user_id, document_urls);
      
      res.status(200).json({
        success: true,
        message: 'Business documents updated successfully'
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
