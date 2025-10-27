import { NextFunction, Request, Response } from 'express';
import { CreateBidDto, UpdateBidDto, BidStatusUpdateDto } from './project-bid.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';
import ProjectBidService from './project-bid.service';
import HttpException from '../../exceptions/HttpException';
import DB, { T } from '../../../database/index';

class ProjectBidController {
    public projectBidService = new ProjectBidService();

    public createBid = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bidData: CreateBidDto = req.body;
            const userId = req.user.user_id;
            
            // Get freelancer profile id from user id
            const freelancerProfile = await DB(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .first();
            
            if (!freelancerProfile) {
                throw new HttpException(403, "Only freelancers can place bids");
            }

            // Get or create application
            let application = await DB(T.APPLIED_PROJECTS)
                .where({ 
                    projects_task_id: bidData.project_id,
                    user_id: userId
                })
                .first();

            if (!application) {
                // Create application first
                application = await DB(T.APPLIED_PROJECTS)
                    .insert({
                        projects_task_id: bidData.project_id,
                        user_id: userId,
                        freelancer_id: freelancerProfile.freelancer_id,
                        description: bidData.proposal,
                        created_by: userId
                    })
                    .returning('*');
            }

            const bid = await this.projectBidService.createBid(
                userId,
                freelancerProfile.freelancer_id,
                application.applied_projects_id,
                bidData
            );

            res.status(201).json({ data: bid, message: 'Bid created successfully' });
        } catch (error) {
            next(error);
        }
    };

    public updateBid = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bidId = parseInt(req.params.id);
            const updateData: UpdateBidDto = req.body;
            const userId = req.user.user_id;

            const bid = await this.projectBidService.updateBid(userId, bidId, updateData);
            res.status(200).json({ data: bid, message: 'Bid updated successfully' });
        } catch (error) {
            next(error);
        }
    };

    public updateBidStatus = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bidId = parseInt(req.params.id);
            const statusData: BidStatusUpdateDto = req.body;
            const userId = req.user.user_id;

            const bid = await this.projectBidService.updateBidStatus(userId, bidId, statusData);
            res.status(200).json({ 
                data: bid, 
                message: `Bid ${statusData.status} successfully` 
            });
        } catch (error) {
            next(error);
        }
    };

    public getProjectBids = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectId = parseInt(req.params.projectId);
            const bids = await this.projectBidService.getBidsByProject(projectId);
            res.status(200).json({ data: bids });
        } catch (error) {
            next(error);
        }
    };

    public getFreelancerBids = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.user_id;
            
            const freelancerProfile = await DB(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .first();
            
            if (!freelancerProfile) {
                throw new HttpException(403, "Only freelancers can view their bids");
            }

            const bids = await this.projectBidService.getBidsByFreelancer(freelancerProfile.freelancer_id);
            res.status(200).json({ data: bids });
        } catch (error) {
            next(error);
        }
    };

    public getBid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bidId = parseInt(req.params.id);
            const bid = await this.projectBidService.getBidById(bidId);
            res.status(200).json({ data: bid });
        } catch (error) {
            next(error);
        }
    };

    public deleteBid = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bidId = parseInt(req.params.id);
            const userId = req.user.user_id;

            await this.projectBidService.deleteBid(userId, bidId);
            res.status(200).json({ message: 'Bid deleted successfully' });
        } catch (error) {
            next(error);
        }
    };
}

export default ProjectBidController;