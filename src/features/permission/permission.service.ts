import { PermissionDto } from "./permission.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { PERMISSION } from "../../../database/permission.schema";

class PermissionService {
    public getPermissions = async (): Promise<PermissionDto[]> => {
        // Admins should see all permissions, including critical ones
        return await DB(T.PERMISSION).select("*").orderBy('permission_id', 'asc');
    }

    public async createPermission(data: PermissionDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Permission data is empty");
        const [permission] = await DB(T.PERMISSION).insert(data).returning("*");
        return permission;
    }

    public async updatePermission(data: Partial<PermissionDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");
        const [updated] = await DB(T.PERMISSION).where({ permission_id: data.permission_id }).update(data).returning("*");
        if (!updated) throw new HttpException(404, "Permission not found");
        return updated;
    }

    public async deletePermission(permissionId: number): Promise<void> {
        const permission = await DB(T.PERMISSION).where({ permission_id: permissionId }).first();
        if (!permission) throw new HttpException(404, "Permission not found");

        const assignments = await DB('role_permission').where({ permission_id: permissionId }).count('permission_id as count').first();
        if (Number(assignments?.count) > 0) {
            throw new HttpException(400, "Cannot delete permission currently assigned to roles");
        }

        await DB(T.PERMISSION).where({ permission_id: permissionId }).delete();
    }
}
export default PermissionService;