import { Router } from 'express';
import CareersController from './careers.controller';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import { CreateCareerDto, UpdateCareerDto } from './careers.dto';

class CareersRoute implements Route {
    public path = '/careers';
    public router = Router();
    public careersController = new CareersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Public routes (Get all/Get one)
        this.router.get(`${this.path}`, this.careersController.getCareers);
        this.router.get(`${this.path}/:id(\\d+)`, this.careersController.getCareerById);

        // Protected routes (Create, Update, Delete)
        this.router.post(
            `${this.path}`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(CreateCareerDto, 'body', false, []),
            this.careersController.createCareer
        );

        this.router.put(
            `${this.path}/:id(\\d+)`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(UpdateCareerDto, 'body', true, []),
            this.careersController.updateCareer
        );

        this.router.delete(
            `${this.path}/:id(\\d+)`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.careersController.deleteCareer
        );
    }
}

export default CareersRoute;
