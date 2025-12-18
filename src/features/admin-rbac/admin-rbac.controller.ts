import { NextFunction, Request, Response } from 'express';
import AdminRBACService from './admin-rbac.service';
import { CreateRoleDto, UpdateRoleDto, CreatePermissionDto, UpdatePermissionDto, BulkAssignPermissionDto } from './admin-rbac.dto';

class AdminRBACController {
    public adminRbacService = new AdminRBACService();

    // Roles
    public createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: CreateRoleDto = req.body;
            const result = await this.adminRbacService.createRole(data);
            res.status(201).json({ data: result, message: 'Role created' });
        } catch (error) {
            next(error);
        }
    };

    public updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);
            const data: UpdateRoleDto = req.body;
            const result = await this.adminRbacService.updateRole(roleId, data);
            res.status(200).json({ data: result, message: 'Role updated' });
        } catch (error) {
            next(error);
        }
    };

    public deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);
            await this.adminRbacService.deleteRole(roleId);
            res.status(200).json({ message: 'Role deleted' });
        } catch (error) {
            next(error);
        }
    };

    // Permissions
    public createPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: CreatePermissionDto = req.body;
            const result = await this.adminRbacService.createPermission(data);
            res.status(201).json({ data: result, message: 'Permission created' });
        } catch (error) {
            next(error);
        }
    };

    public updatePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const permissionId = Number(req.params.id);
            const data: UpdatePermissionDto = req.body;
            const result = await this.adminRbacService.updatePermission(permissionId, data);
            res.status(200).json({ data: result, message: 'Permission updated' });
        } catch (error) {
            next(error);
        }
    };

    public deletePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const permissionId = Number(req.params.id);
            await this.adminRbacService.deletePermission(permissionId);
            res.status(200).json({ message: 'Permission deleted' });
        } catch (error) {
            next(error);
        }
    };

    // Matrix
    public addPermissionToRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);
            const { permission_id } = req.body;
            await this.adminRbacService.addPermissionToRole(roleId, Number(permission_id));
            res.status(200).json({ message: 'Permission assigned' });
        } catch (error) {
            next(error);
        }
    }

    public removePermissionFromRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);
            const permissionId = Number(req.params.permissionId);
            await this.adminRbacService.removePermissionFromRole(roleId, permissionId);
            res.status(200).json({ message: 'Permission removed' });
        } catch (error) {
            next(error);
        }
    }

    public bulkUpdatePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);
            const data: BulkAssignPermissionDto = req.body;
            await this.adminRbacService.bulkUpdateRolePermissions(roleId, data.permission_ids);
            res.status(200).json({ message: 'Permissions updated' });
        } catch (error) {
            next(error);
        }
    }
}

export default AdminRBACController;
