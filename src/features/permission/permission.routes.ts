import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import permissionController from './permission.controller';
import { PermissionDto } from './permission.dto';
import { requireRole } from '../../middlewares/role.middleware';

class permissionRoute implements Route {

  public path = '/permission';
  public router = Router();
  public permissionController = new permissionController();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
   
  // Get all permissions - Admin or Super Admin access
  this.router.get(`${this.path}/getpermission`, 
    requireRole('ADMIN', 'SUPER_ADMIN'),
    this.permissionController.getallpermission
  );
  
  // Create new permission - Super Admin only
  this.router.post(`${this.path}/insertpermission`, 
    requireRole('SUPER_ADMIN'),
    validationMiddleware(PermissionDto, 'body', false, []), 
    (req, res, next) => this.permissionController.newpermission(req, res, next)
  );
  
  // Update permission - Super Admin only
  this.router.put(`${this.path}/updatepermissionid/:id`, 
    requireRole('SUPER_ADMIN'),
    validationMiddleware(PermissionDto, 'body', false, []), 
    (req, res, next) => this.permissionController.updatepermissionbyid(req, res, next)
  ); 
  
   
   }
}
export default  permissionRoute;