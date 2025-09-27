import { Router } from 'express';
import Route from '../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import Savedprojectcontroller from '../controllers/saved_project.controller';
import { SavedProjectsDto } from '../dtos/saved_project.dto';

class SavedprojectRoute implements Route {

    public path = '/saved';
    public router = Router();
    public Savedprojectcontroller = new Savedprojectcontroller();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
      
        this.router.post(`${this.path}/create`, validationMiddleware(SavedProjectsDto, 'body', false, []), (req, res, next) => this.Savedprojectcontroller.addsave(req, res, next));

        this.router.get(`${this.path}/listsave`, this.Savedprojectcontroller.getAllsaved);

        this.router.delete(`${this.path}/remove-saved`, validationMiddleware(SavedProjectsDto, 'body', false, []), (req, res, next) => this.Savedprojectcontroller.removeSavedProject(req, res, next));

        this.router.post(`${this.path}/savedbyuser_id`, this.Savedprojectcontroller.getUserId);

    }
}
export default SavedprojectRoute;
