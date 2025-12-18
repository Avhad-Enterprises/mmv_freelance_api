import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import AdminRBACController from './admin-rbac.controller';
import { CreateRoleDto, UpdateRoleDto, CreatePermissionDto, UpdatePermissionDto, BulkAssignPermissionDto } from './admin-rbac.dto';
import { requireRole } from '../../middlewares/role.middleware';

class AdminRBACRoute implements Route {
    public path = '/admin/rbac';
    public router = Router();
    public controller = new AdminRBACController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Super Admin Only Guard
        // All routes below are protected
        // Roles
        this.router.post(`${this.path}/roles`,
            requireRole('SUPER_ADMIN'),
            validationMiddleware(CreateRoleDto, 'body', false, []),
            this.controller.createRole
        );
        this.router.put(`${this.path}/roles/:id`,
            requireRole('SUPER_ADMIN'),
            validationMiddleware(UpdateRoleDto, 'body', true, []),
            this.controller.updateRole
        );
        this.router.delete(`${this.path}/roles/:id`,
            requireRole('SUPER_ADMIN'),
            this.controller.deleteRole
        );

        // Permissions
        this.router.post(`${this.path}/permissions`,
            requireRole('SUPER_ADMIN'),
            validationMiddleware(CreatePermissionDto, 'body', false, []),
            this.controller.createPermission
        );
        this.router.put(`${this.path}/permissions/:id`,
            requireRole('SUPER_ADMIN'),
            validationMiddleware(UpdatePermissionDto, 'body', true, []),
            this.controller.updatePermission
        );
        this.router.delete(`${this.path}/permissions/:id`,
            requireRole('SUPER_ADMIN'),
            this.controller.deletePermission
        );

        // Matrix (Linking)
        this.router.post(`${this.path}/roles/:id/permissions`,
            requireRole('SUPER_ADMIN'),
            this.controller.addPermissionToRole
        );
        this.router.delete(`${this.path}/roles/:id/permissions/:permissionId`,
            requireRole('SUPER_ADMIN'),
            this.controller.removePermissionFromRole
        );
        this.router.put(`${this.path}/roles/:id/permissions`,
            requireRole('SUPER_ADMIN'),
            validationMiddleware(BulkAssignPermissionDto, 'body', false, []),
            this.controller.bulkUpdatePermissions
        );
    }
}

export default AdminRBACRoute;
