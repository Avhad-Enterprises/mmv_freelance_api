import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import roleController from './role.controller';
import { RoleDto } from './role.dto';
import { requireRole } from '../../middlewares/role.middleware';

class roleRoute implements Route {

  public path = '/role';
  public router = Router();
  public roleController = new roleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // Get all roles - Admin or Super Admin access
    this.router.get(`${this.path}/getrole`, 
      requireRole('ADMIN', 'SUPER_ADMIN'),
      this.roleController.getallrole
    );
    
    // Create new role - Super Admin only
    this.router.post(`${this.path}/insertrole`, 
      requireRole('SUPER_ADMIN'),
      validationMiddleware(RoleDto, 'body', false, []), 
      (req, res, next) => this.roleController.insertrolein(req, res, next)
    );
    
    // Update role - Super Admin only
    this.router.put(`${this.path}/updaterole/:id`, 
      requireRole('SUPER_ADMIN'),
      validationMiddleware(RoleDto, 'body', false, []), 
      (req, res, next) => this.roleController.updaterolebyid(req, res, next)
    );
    
    // Assign permission to role - Super Admin only
    this.router.post(`${this.path}/insertpermission`, 
      requireRole('SUPER_ADMIN'),
      (req, res, next) => this.roleController.insertpermission(req, res, next)
    );
    
    // Get permissions for role - Admin or Super Admin access
    this.router.get(`${this.path}/getpermission`, 
      requireRole('ADMIN', 'SUPER_ADMIN'),
      (req, res, next) => this.roleController.getpermissionto(req, res, next)
    );
    
  }
}
export default roleRoute;
