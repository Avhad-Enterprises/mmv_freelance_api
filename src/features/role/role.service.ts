import { RoleDto } from "./role.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/util";
import { ROLE } from "../../../database/role.schema";
import { ROLE_PERMISSION } from "../../../database/role_permission.schema"

class RoleService {
    static permissionfromrole: any;
    static getpermissionby: any;
    static assignPermissions: any;
    static insertpermissionfromrole(roleId: number, permissions: any[]) {
        throw new Error("Method not implemented.");
    }
    static assignpermissiontorole(roleId: any, permissions: any) {
        throw new Error("Method not implemented.");
    }
    public getallroleby = async (): Promise<RoleDto[]> => {
        try {
            const result = await DB(T.ROLE)
                .where({ is_active: true })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching Role');
        }
    }
    public async insertroleintable(data: RoleDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Role data is empty");
        }
        const insertedRole = await DB(T.ROLE).insert(data).returning("*");
        return insertedRole[0];
    }
    public async updaterolebyidintable(data: Partial<RoleDto>): Promise<any> {

        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        const updated = await DB(T.ROLE)
            .where({ role_id: data.role_id })
            .update(data)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Role not found or not updated");

        return updated[0];
    }

    public async insertpermissiontorole(data: RoleDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Role data is empty");
        }
        const insertedROLE_PERMISSION = await DB(T.ROLE_PERMISSION).insert(data).returning("*");
        return insertedROLE_PERMISSION[0];
    }

    public async getpermissiontorole(role_id: number): Promise<any> {
        if (!role_id) throw new HttpException(400, "Role ID is required");

        const role = await DB(T.ROLE_PERMISSION).where({ role_id }).first();
        if (!role) throw new HttpException(404, "ROLE not found");

        return role;
    }
}

export default RoleService;