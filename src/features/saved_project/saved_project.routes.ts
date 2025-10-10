import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import authMiddleware from '../../middlewares/auth.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import Savedprojectcontroller from './saved_project.controller';
import { SavedProjectsDto } from './saved_project.dto';

class SavedprojectRoute implements Route {

    public path = '/saved';
    public router = Router();
    public Savedprojectcontroller = new Savedprojectcontroller();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
      
        // ✅ Personal operation - save project for authenticated user
        this.router.post(`${this.path}/save-project`, 
            authMiddleware, 
            validationMiddleware(SavedProjectsDto, 'body', false, []), 
            (req, res, next) => this.Savedprojectcontroller.addsave(req as any, res, next)
        );

        // ⚠️ Admin operation - get all saved projects (keep existing)
        this.router.get(`${this.path}/listsave`, 
            requireRole('ADMIN', 'SUPER_ADMIN'), 
            this.Savedprojectcontroller.getAllsaved
        );

        // ✅ Personal operation - remove saved project for authenticated user
        this.router.delete(`${this.path}/unsave-project`, 
            authMiddleware, 
            validationMiddleware(SavedProjectsDto, 'body', false, []), 
            (req, res, next) => this.Savedprojectcontroller.removeSavedProject(req as any, res, next)
        );

        // ✅ Personal operation - get authenticated user's saved projects
        this.router.get(`${this.path}/my-saved-projects`, 
            authMiddleware, 
            (req, res, next) => this.Savedprojectcontroller.getUserId(req as any, res, next)
        );

    }
}
export default SavedprojectRoute;
