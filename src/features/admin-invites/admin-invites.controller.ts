// src/features/admin-invites/controllers/admin-invites.controller.ts

import { NextFunction, Response, Request } from 'express';
import AdminInvitesService from './admin-invites.service';
import { CreateAdminInviteDto, AcceptInviteDto, CompleteRegistrationDto } from './admin-invites.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';
import { isEmpty } from '../../utils/common';

class AdminInvitesController {
    public adminInvitesService = new AdminInvitesService();

    /**
     * Create a new admin invitation
     * POST /admin/invites
     */
    public createInvite = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: CreateAdminInviteDto = req.body;

            if (isEmpty(userData)) {
                res.status(400).json({ message: 'Invalid invitation data' });
                return;
            }

            // Get the user ID from the authenticated user
            const invitedBy = req.user.user_id;

            const invitation = await this.adminInvitesService.createInvite(userData, invitedBy);

            res.status(201).json({
                data: invitation,
                message: 'Invitation sent successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Accept an invitation
     * POST /admin/invites/accept
     */
    public acceptInvite = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: AcceptInviteDto = req.body;

            if (isEmpty(userData) || !userData.token) {
                res.status(400).json({ message: 'Invitation token is required' });
                return;
            }

            const result = await this.adminInvitesService.acceptInvite(userData);

            res.status(200).json({
                data: result,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all invitations (admin only)
     * GET /admin/invites
     */
    public getAllInvites = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const invites = await this.adminInvitesService.getAllInvites();

            res.status(200).json({
                data: invites,
                message: 'Invitations retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Revoke an invitation (admin only)
     * DELETE /admin/invites/:id
     */
    public revokeInvite = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const invitationId = parseInt(req.params.id);

            if (!invitationId || isNaN(invitationId)) {
                res.status(400).json({ message: 'Invalid invitation ID' });
                return;
            }

            await this.adminInvitesService.revokeInvite(invitationId);

            res.status(200).json({
                message: 'Invitation revoked successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Verify invitation token (public)
     * GET /admin/invites/verify?token=xxx
     */
    public verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = req.query.token as string;

            if (!token || typeof token !== 'string') {
                res.status(400).json({ message: 'Invitation token is required' });
                return;
            }

            const result = await this.adminInvitesService.verifyToken(token);

            res.status(200).json({
                data: result,
                message: 'Token is valid'
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Complete registration with invitation token (public)
     * POST /admin/invites/register
     */
    public completeRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const registrationData: CompleteRegistrationDto = req.body;

            if (isEmpty(registrationData)) {
                res.status(400).json({ message: 'Invalid registration data' });
                return;
            }

            const result = await this.adminInvitesService.completeRegistration(registrationData);

            res.status(201).json({
                data: result,
                message: 'Registration completed successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}

export default AdminInvitesController;