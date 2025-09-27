import { Router } from 'express';
import Route from '../interfaces/route.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import locationController from '../controllers/location.controller';
import { BlogDto } from '../dtos/blog.dto';

class locationRoute implements Route {

    public path = '/location';
    public router = Router();
    public locationController = new locationController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        //users section  , validationMiddleware(usersDto, 'body', false, [])
        this.router.get(`${this.path}/countries`, (req, res, next) => this.locationController.getAllCountry(req, res, next));
        this.router.get(`${this.path}/states/:country_id`, (req, res, next) => this.locationController.getstatesby(req, res, next));
        this.router.get(`${this.path}/cities/:state_id`, (req, res, next) => this.locationController.getcitiesby(req, res, next));
        this.router.post(`${this.path}/states`, (req, res, next) => this.locationController.getStatesBy(req, res, next));
        this.router.post(`${this.path}/cities`, (req, res, next) => this.locationController.getCities(req, res, next));
    }
}

export default locationRoute;
