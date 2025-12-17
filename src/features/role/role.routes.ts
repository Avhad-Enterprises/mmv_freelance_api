import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import roleController from './role.controller';
import { requireRole } from '../../middlewares/role.middleware';

class roleRoute implements Route {

  public path = '/role';
  public router = Router();
  public roleController = new roleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // Role Management (Read Only)
    this.router.get(`${this.path}`, requireRole('ADMIN', 'SUPER_ADMIN'), this.roleController.getRoles);

    // Permission Linking (Read Only)
    this.router.get(`${this.path}/:id/permissions`,
      requireRole('ADMIN', 'SUPER_ADMIN'),
      this.roleController.getPermissions
    );
  }
}
export default roleRoute;
