import { CmsDto } from "./cms.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { CMS } from "../../../database/cms.schema";

class CmsService {

    public async addtocms(data: CmsDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Cms data is empty");
        }
        const insertedCms = await DB(T.CMS)
            .insert(data)
            .returning("*");
        return insertedCms[0];
    }
    public async updatecmsbyid(data: Partial<CmsDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        if (!data.cms_id) throw new HttpException(400, "cms id is required for update");

        const updated = await DB(T.CMS)
            .where({ cms_id: data.cms_id })
            .update({ ...data, updated_at: DB.fn.now() })
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Cms not found or not updated");

        return updated[0];

    }
    public async SoftDeletecms(data: Partial<CmsDto>): Promise<any> {

        if (isEmpty(data)) throw new HttpException(400, "Data is required");

        const deleted = await DB(T.CMS)
            .where({ cms_id: data.cms_id })
            .update(data)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Cms not found or not delete");

        return deleted[0];
    }
    public async geteditcmsby(cms_id: number): Promise<any> {
        if (!cms_id) throw new HttpException(400, "Cms ID is required");

        const cms = await DB(T.CMS).where({ cms_id }).first();
        if (!cms) throw new HttpException(404, "cms not found");

        return cms;
    }
    public async getallcmsbytable(): Promise<any> {
        try {
            const result = await DB(T.CMS)
                .where({ is_active: true, is_deleted: false })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching cms');
        }
    }
}
export default CmsService;