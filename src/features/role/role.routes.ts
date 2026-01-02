import { Router } from "express";
import Route from "../../interfaces/route.interface";
import roleController from "./role.controller";
import { requirePermission } from "../../middlewares/permission.middleware";

class roleRoute implements Route {
  public path = "/role";
  public router = Router();
  public roleController = new roleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Role Management (Read Only)
    this.router.get(
      `${this.path}`,
      requirePermission("admin.roles"),
      this.roleController.getRoles
    );

    // Permission Linking (Read Only)
    this.router.get(
      `${this.path}/:id/permissions`,
      requirePermission("admin.roles"),
      this.roleController.getPermissions
    );
  }
}
export default roleRoute;
