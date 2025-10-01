import { SeoDto } from "./seo.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { ISeo } from './seo.interface';

class subscribedEmailservice {
  public Insert = async (data: SeoDto): Promise<any> => {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }
    const res = await DB(T.SEO)
    .insert(data)
    .returning("*");
    return res[0];
  }

  public getAllbyseodetail = async (): Promise<ISeo[]> => {
    try {
      const result = await DB(T.SEO)
        .where({ is_active: 1 })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching services');
    }
  }

    public async updatebyseodetail(id: number, data: Partial<SeoDto>): Promise<any> {
      if (!id) throw new HttpException(400, 'ID is required');
      if (isEmpty(data)) throw new HttpException(400, 'Update data is empty');
        
      const updated = await DB(T.SEO)
        .where({ id })
        .update(data)
        .returning('*');
    
      if (!updated || updated.length === 0) {
        throw new HttpException(404, 'SEO not found or not updated');
      }
    
      return updated[0];
    }
  }
export default subscribedEmailservice;