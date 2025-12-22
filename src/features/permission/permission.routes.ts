import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import permissionController from './permission.controller';
import { requireRole } from '../../middlewares/role.middleware';

class permissionRoute implements Route {

  public path = '/permission';
  public router = Router();
  public permissionController = new permissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all permissions - Admin or Super Admin access (Read Only)
    this.router.get(`${this.path}`, requireRole('ADMIN', 'SUPER_ADMIN'), this.permissionController.getPermissions);
  }
}
export default permissionRoute;