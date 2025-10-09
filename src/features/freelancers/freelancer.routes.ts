import { Router } from 'express';
import { FreelancerController } from './freelancer.controller';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import { FreelancerUpdateDto } from '../freelancers/freelancer.update.dto';
import Route from '../../interfaces/route.interface';

/**
 * Freelancer Routes
 * Public routes for discovery, protected routes for profile management
 */
export class FreelancerRoutes implements Route {
    public path = '/freelancers';
    public router = Router();
    private freelancerController = new FreelancerController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        //Get all freelancers

        this.router.get(
            `${this.path}/getfreelancers`,
            requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'),
            this.freelancerController.getAllFreelancers
        );

        this.router.get(
            `${this.path}/availablefreelancer`,
            this.freelancerController.getAvailableFreelancers
        );

    }
}