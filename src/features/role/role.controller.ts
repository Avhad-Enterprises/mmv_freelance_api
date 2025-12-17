import { NextFunction, Request, Response } from "express";
import RoleService from "./role.service";

class roleController {
    public RoleService = new RoleService();

    // Role READ
    public getRoles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = await this.RoleService.getallroleby();
            res.status(200).json({ data: role, success: true });
        } catch (err) {
            next(err);
        }
    };

    // Permission Linking READ
    public getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);
            const permissions = await this.RoleService.getPermissionsForRole(roleId);
            res.status(200).json({ data: permissions, message: "Permissions fetched" });
        } catch (error) {
            next(error);
        }
    };
}
export default roleController;