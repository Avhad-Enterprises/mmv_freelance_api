import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import ProjectBidController from './project-bid.controller';
import { CreateBidDto, UpdateBidDto, BidStatusUpdateDto } from './project-bid.dto';
import { requireRole } from '../../middlewares/role.middleware';
import authMiddleware from '../../middlewares/auth.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';

class ProjectBidRoute implements Route {
    public path = '/project-bids';
    public router = Router();
    public projectBidController = new ProjectBidController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Create a new bid
        this.router.post(
            `${this.path}/create`,
            authMiddleware,
            requireRole('FREELANCER', 'VIDEOGRAPHER', 'VIDEO_EDITOR'),
            validationMiddleware(CreateBidDto, 'body', false, []),
            this.projectBidController.createBid
        );

        // Update a bid
        this.router.put(
            `${this.path}/update/:id`,
            authMiddleware,
            requireRole('FREELANCER', 'VIDEOGRAPHER', 'VIDEO_EDITOR'),
            validationMiddleware(UpdateBidDto, 'body', false, []),
            this.projectBidController.updateBid
        );

        // Update bid status (accept/reject)
        this.router.patch(
            `${this.path}/:id/status`,
            authMiddleware,
            requireRole('CLIENT', 'ADMIN'),
            validationMiddleware(BidStatusUpdateDto, 'body', false, []),
            this.projectBidController.updateBidStatus
        );

        // Get all bids for a project
        this.router.get(
            `${this.path}/project/:projectId`,
            authMiddleware,
            this.projectBidController.getProjectBids
        );

        // Get freelancer's bids
        this.router.get(
            `${this.path}/my-bids`,
            authMiddleware,
            requireRole('FREELANCER', 'VIDEOGRAPHER', 'VIDEO_EDITOR'),
            this.projectBidController.getFreelancerBids
        );

        // Get specific bid
        this.router.get(
            `${this.path}/:id`,
            authMiddleware,
            this.projectBidController.getBid
        );

        // Delete a bid
        this.router.delete(
            `${this.path}/:id`,
            authMiddleware,
            requireRole('FREELANCER', 'VIDEOGRAPHER', 'VIDEO_EDITOR'),
            this.projectBidController.deleteBid
        );
    }
}

export default ProjectBidRoute;