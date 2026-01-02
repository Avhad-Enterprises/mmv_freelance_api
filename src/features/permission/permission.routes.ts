import { Router } from "express";
import Route from "../../interfaces/route.interface";
import permissionController from "./permission.controller";
import { requirePermission } from "../../middlewares/permission.middleware";

class permissionRoute implements Route {
  public path = "/permission";
  public router = Router();
  public permissionController = new permissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all permissions - Admin or Super Admin access (Read Only)
    this.router.get(
      `${this.path}`,
      requirePermission("admin.roles"),
      this.permissionController.getPermissions
    );
  }
}
export default permissionRoute;
