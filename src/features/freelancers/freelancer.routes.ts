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

        //Get all freelancers (public endpoint for homepage)

        this.router.get(
            `${this.path}/getfreelancers`,
            requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'),
            this.freelancerController.getAllFreelancers
        );

        //Get all freelancers (public-safe version without email/phone)
        this.router.get(
            `${this.path}/getfreelancers-public`,
            this.freelancerController.getAllFreelancersPublic
        );
    }
}