import { PermissionDto } from "./permission.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/util";
import { PERMISSION } from "../../../database/permission.schema";

class PermissionService {
    public getallpermissionby = async (): Promise<PermissionDto[]> => {
        try {
            const result = await DB(T.PERMISSION)
                .where({ is_critical: false })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching Permission');
        }
    }
    public async createnewpermission(data: PermissionDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Permission data is empty");
        }
        const insertedPermission = await DB(T.PERMISSION).insert(data).returning("*");
        return insertedPermission[0];
    }
    public async updatepermissionbyids(data: Partial<PermissionDto>): Promise<any> {

        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        const updated = await DB(T.PERMISSION)
            .where({ permission_id: data.permission_id })
            .update(data)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Permission not found or not updated");

        return updated[0];
    }
}
export default PermissionService;