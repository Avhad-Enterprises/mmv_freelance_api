import { Router } from 'express';
import Route from '../interfaces/route.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import permissionController from '../controllers/permission.controller';
import { PermissionDto } from '../dtos/permission.dto';

class permissionRoute implements Route {

  public path = '/permission';
  public router = Router();
  public permissionController = new permissionController();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
   
  this.router.get(`${this.path}/getpermission`, this.permissionController.getallpermission);
  this.router.post(`${this.path}/insertpermission`, validationMiddleware(PermissionDto, 'body', false, []), (req, res, next) => this.permissionController.newpermission(req, res, next));
  this.router.put(`${this.path}/updatepermissionid/:id`, validationMiddleware(PermissionDto, 'body', false, []), (req, res, next) => this.permissionController.updatepermissionbyid(req, res, next)); 
  
   
   }
}
export default  permissionRoute;