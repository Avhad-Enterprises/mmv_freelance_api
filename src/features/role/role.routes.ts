import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import roleController from './role.controller';
import { RoleDto } from './role.dto';

class roleRoute implements Route {

  public path = '/role';
  public router = Router();
  public roleController = new roleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.get(`${this.path}/getrole`, this.roleController.getallrole);
    this.router.post(`${this.path}/insertrole`, validationMiddleware(RoleDto, 'body', false, []), (req, res, next) => this.roleController.insertrolein(req, res, next));
    this.router.put(`${this.path}/updaterole/:id`, validationMiddleware(RoleDto, 'body', false, []), (req, res, next) => this.roleController.updaterolebyid(req, res, next));
    this.router.post(`${this.path}/insertpermission`, (req, res, next) => this.roleController.insertpermission(req, res, next));
    this.router.get(`${this.path}/getpermission`, (req, res, next) => this.roleController.getpermissionto(req, res, next));
    
  }
}
export default roleRoute;
