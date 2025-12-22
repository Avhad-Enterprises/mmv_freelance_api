import { RoleDto } from "./role.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { ROLE } from "../../../database/role.schema";
import { ROLE_PERMISSION } from "../../../database/role_permission.schema"

class RoleService {
    // Role Management
    public getallroleby = async (): Promise<RoleDto[]> => {
        return await DB(T.ROLE).select("*").orderBy('role_id', 'asc');
    }

    public async insertroleintable(data: RoleDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Role data is empty");
        const [role] = await DB(T.ROLE).insert(data).returning("*");
        return role;
    }

    public async updaterolebyidintable(data: Partial<RoleDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");
        const [updated] = await DB(T.ROLE).where({ role_id: data.role_id }).update(data).returning("*");
        if (!updated) throw new HttpException(404, "Role not found");
        return updated;
    }

    public async deleteRole(roleId: number): Promise<void> {
        const role = await DB(T.ROLE).where({ role_id: roleId }).first();
        if (!role) throw new HttpException(404, "Role not found");

        const systemRoles = ['SUPER_ADMIN', 'ADMIN', 'CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR'];
        if (systemRoles.includes(role.name)) {
            throw new HttpException(400, `Cannot delete system role: ${role.name}`);
        }

        const userCount = await DB('user_roles').where({ role_id: roleId }).count('id as count').first();
        if (Number(userCount?.count) > 0) {
            throw new HttpException(400, "Cannot delete role with assigned users");
        }

        await DB(T.ROLE).where({ role_id: roleId }).delete();
    }

    // Permission Linking
    public async getPermissionsForRole(roleId: number): Promise<any[]> {
        return await DB(T.ROLE_PERMISSION)
            .join('permission', 'role_permission.permission_id', 'permission.permission_id')
            .where('role_permission.role_id', roleId)
            .select('permission.*');
    }

    public async addPermissionToRole(roleId: number, permissionId: number): Promise<void> {
        const exists = await DB(T.ROLE_PERMISSION).where({ role_id: roleId, permission_id: permissionId }).first();
        if (exists) return; // Already linked

        await DB(T.ROLE_PERMISSION).insert({ role_id: roleId, permission_id: permissionId });
    }

    public async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
        const role = await DB(T.ROLE).where({ role_id: roleId }).first();
        if (role && role.name === 'SUPER_ADMIN') {
            throw new HttpException(400, "Cannot remove permissions from Super Admin");
        }

        await DB(T.ROLE_PERMISSION).where({ role_id: roleId, permission_id: permissionId }).delete();
    }

    public async bulkUpdateRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
        const role = await DB(T.ROLE).where({ role_id: roleId }).first();
        if (role && role.name === 'SUPER_ADMIN') {
            throw new HttpException(400, "Cannot modify Super Admin permissions");
        }

        await DB.transaction(async trx => {
            await trx(T.ROLE_PERMISSION).where({ role_id: roleId }).delete();

            if (permissionIds.length > 0) {
                const inserts = permissionIds.map(pid => ({ role_id: roleId, permission_id: pid }));
                await trx(T.ROLE_PERMISSION).insert(inserts);
            }
        });
    }
}

export default RoleService;