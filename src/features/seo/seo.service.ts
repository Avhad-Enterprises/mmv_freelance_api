import { SeoDto, UpdateSeoDto } from "./seo.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { ISeo } from './seo.interface';

class SeoService {
  // Create a new SEO entry
  public async Insert(seoData: SeoDto): Promise<ISeo> {
    if (isEmpty(seoData)) {
      throw new HttpException(400, "SEO data is invalid");
    }

    const res = await DB(T.SEO)
      .insert(seoData)
      .returning("*");
    return res[0];
  }

  // Get all SEO entries (excluding soft deleted)
  public async GetAllSeos(): Promise<ISeo[]> {
    try {
      const result = await DB(T.SEO)
        .where({ is_deleted: false })
        .select("*")
        .orderBy('created_at', 'desc');
      return result;
    } catch (error) {
      throw new HttpException(500, 'Error fetching SEO entries');
    }
  }

  // Get SEO entry by ID
  public async GetSeoById(id: number): Promise<ISeo> {
    if (!id) {
      throw new HttpException(400, 'SEO ID is required');
    }

    const result = await DB(T.SEO)
      .where({ id, is_deleted: false })
      .select("*")
      .first();

    if (!result) {
      throw new HttpException(404, 'SEO entry not found');
    }

    return result;
  }

  // Update SEO entry
  public async UpdateSeo(id: number, updateData: UpdateSeoDto): Promise<ISeo> {
    if (!id) {
      throw new HttpException(400, 'SEO ID is required');
    }

    if (isEmpty(updateData)) {
      throw new HttpException(400, 'Update data is empty');
    }

    const updated = await DB(T.SEO)
      .where({ id, is_deleted: false })
      .update(updateData)
      .returning('*');

    if (!updated || updated.length === 0) {
      throw new HttpException(404, 'SEO entry not found or not updated');
    }

    return updated[0];
  }

  // Soft delete SEO entry
  public async DeleteSeo(id: number): Promise<ISeo> {
    if (!id) {
      throw new HttpException(400, 'SEO ID is required');
    }

    const deleted = await DB(T.SEO)
      .where({ id, is_deleted: false })
      .update({
        is_deleted: true
      })
      .returning('*');

    if (!deleted || deleted.length === 0) {
      throw new HttpException(404, 'SEO entry not found or already deleted');
    }

    return deleted[0];
  }

  // Legacy methods for backward compatibility (deprecated)
  public getAllbyseodetail = this.GetAllSeos;
  public updatebyseodetail = this.UpdateSeo;
}

export default SeoService;