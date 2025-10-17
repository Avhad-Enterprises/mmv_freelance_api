import { FaqDto } from "./faq.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { FAQ } from "../../../database/faq.schema";

export class FaqService {
    /**
     * Retrieves a single FAQ by ID
     */
    public async getfaq(faq_id: number): Promise<any> {
        if (!faq_id) throw new HttpException(400, "FAQ ID is required");

        const faq = await DB(T.FAQ).where({ faq_id }).first();
        if (!faq) throw new HttpException(404, "faq not found");

        return faq;
    }

    /**
     * Creates a new FAQ entry in the database
     */
    public async insertfaqs(data: FaqDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Faq data is empty");
        }
        const insertedFaq = await DB(T.FAQ).insert(data).returning("*");

        return insertedFaq[0];
    }

    /**
     * Updates an existing FAQ
     */
    public async updatefaqs(data: Partial<FaqDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        if (!data.faq_id) throw new HttpException(400, "faq id is required for update");

        const updated = await DB(T.FAQ)
            .where({ faq_id: data.faq_id })
            .update({ ...data, updated_at: DB.fn.now() })
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Faq not found or not updated");

        return updated[0];
    }

    /**
     * Soft deletes an FAQ entry
     */
    public async deleteFAQ(data: Partial<FaqDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Data is required");

        const deleted = await DB(T.FAQ)
            .where({ faq_id: data.faq_id })
            .update(data)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Faq not found or not delete");

        return deleted[0];
    }

    /**
     * Retrieves all active and non-deleted FAQs
     */
    public async getallfaqsbytable(): Promise<any> {
        try {
            const result = await DB(T.FAQ)
                .where({ is_active: true, is_deleted: false })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching faq');
        }
    }
}
export default FaqService;