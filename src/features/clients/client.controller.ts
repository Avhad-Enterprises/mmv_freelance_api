// Client Controller - Handles client-specific HTTP requests
import { Request, Response, NextFunction } from 'express';
import ClientService from './client.service';
import { ClientProfileUpdateDto } from './client.update.dto';
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
   * Update client profile (client_profiles table fields only)
   * PATCH /api/v1/clients/profile
   */
  public updateProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData: ClientProfileUpdateDto = req.body;
      
      // Update client profile fields only
      await this.clientService.updateClientProfile(req.user.user_id, updateData);
      
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
