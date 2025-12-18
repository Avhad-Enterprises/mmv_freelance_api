import { NextFunction, Request, Response } from "express";
import PermissionService from "./permission.service";

class permissionController {
    public PermissionService = new PermissionService();

    public getPermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const permissions = await this.PermissionService.getPermissions();
            res.status(200).json({ data: permissions, success: true });
        } catch (err) {
            next(err);
        }
    };
}
export default permissionController;