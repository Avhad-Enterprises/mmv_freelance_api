import RoleService from '../role/role.service';
import PermissionService from '../permission/permission.service';
import { CreateRoleDto, UpdateRoleDto, CreatePermissionDto, UpdatePermissionDto } from './admin-rbac.dto';

class AdminRBACService {
    private roleService = new RoleService();
    private permissionService = new PermissionService();

    // Roles
    public async createRole(data: CreateRoleDto) {
        return this.roleService.insertroleintable(data as any);
    }

    public async updateRole(roleId: number, data: UpdateRoleDto) {
        data.role_id = roleId;
        return this.roleService.updaterolebyidintable(data as any);
    }

    public async deleteRole(roleId: number) {
        return this.roleService.deleteRole(roleId);
    }

    // Permissions
    public async createPermission(data: CreatePermissionDto) {
        return this.permissionService.createPermission(data as any);
    }

    public async updatePermission(permissionId: number, data: UpdatePermissionDto) {
        data.permission_id = permissionId;
        return this.permissionService.updatePermission(data as any);
    }

    public async deletePermission(permissionId: number) {
        return this.permissionService.deletePermission(permissionId);
    }

    // Matrix
    public async addPermissionToRole(roleId: number, permissionId: number) {
        return this.roleService.addPermissionToRole(roleId, permissionId);
    }

    public async removePermissionFromRole(roleId: number, permissionId: number) {
        return this.roleService.removePermissionFromRole(roleId, permissionId);
    }

    public async bulkUpdateRolePermissions(roleId: number, permissionIds: number[]) {
        return this.roleService.bulkUpdateRolePermissions(roleId, permissionIds);
    }
}

export default AdminRBACService;
