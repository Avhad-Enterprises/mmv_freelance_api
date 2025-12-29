import { FaqDto } from "./faq.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { FAQ } from "../../../database/faq.schema";

export class FaqService {
  /**
   * Retrieves a single FAQ by ID
   */
  public async getFaqById(faqId: number): Promise<any> {
    if (!faqId) throw new HttpException(400, "FAQ ID is required");

    const faq = await DB(T.FAQ).where({ faq_id: faqId }).first();
    if (!faq) throw new HttpException(404, "FAQ not found");

    return faq;
  }

  /**
   * Creates a new FAQ entry in the database
   */
  public async createFaq(data: FaqDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "FAQ data is empty");
    }

    // Set default values and audit fields
    const faqData = {
      ...data,
      created_by: data.created_by || 1, // Default to system user if not provided
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_deleted: false,
    };

    const insertedFaq = await DB(T.FAQ).insert(faqData).returning("*");
    return insertedFaq[0];
  }

  /**
   * Updates an existing FAQ
   */
  public async updateFaq(data: Partial<FaqDto>): Promise<any> {
    if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

    if (!data.faq_id)
      throw new HttpException(400, "FAQ ID is required for update");

    const updateData = {
      ...data,
      updated_by: data.updated_by || 1, // Default to system user if not provided
      updated_at: DB.fn.now(),
    };

    const updated = await DB(T.FAQ)
      .where({ faq_id: data.faq_id })
      .update(updateData)
      .returning("*");

    if (!updated.length)
      throw new HttpException(404, "FAQ not found or not updated");

    return updated[0];
  }

  /**
   * Soft deletes an FAQ entry
   */
  public async deleteFaq(data: Partial<FaqDto>): Promise<any> {
    if (isEmpty(data)) throw new HttpException(400, "Data is required");

    if (!data.faq_id)
      throw new HttpException(400, "FAQ ID is required for deletion");

    const deleteData = {
      is_deleted: true,
      deleted_by: data.deleted_by || 1, // Default to system user if not provided
      deleted_at: DB.fn.now(),
    };

    const deleted = await DB(T.FAQ)
      .where({ faq_id: data.faq_id })
      .update(deleteData)
      .returning("*");

    if (!deleted.length)
      throw new HttpException(404, "FAQ not found or not deleted");

    return deleted[0];
  }

  /**
   * Retrieves all active and non-deleted FAQs
   */
  public async getAllActiveFaqs(): Promise<any> {
    try {
      const result = await DB(T.FAQ)
        .where({ is_active: true, is_deleted: false })
        .select("*")
        .orderBy("created_at", "desc");
      return result;
    } catch (error) {
      throw new HttpException(500, "Error fetching FAQs");
    }
  }

  /**
   * Retrieves all non-deleted FAQs (including inactive) for admin use
   */
  public async getAllFaqs(): Promise<any> {
    try {
      const result = await DB(T.FAQ)
        .where({ is_deleted: false })
        .select("*")
        .orderBy("created_at", "desc");
      return result;
    } catch (error) {
      throw new HttpException(500, "Error fetching FAQs");
    }
  }
}

export default FaqService;
