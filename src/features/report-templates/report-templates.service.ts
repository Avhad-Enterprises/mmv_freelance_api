import { ReportTemplateDTO } from "./report-templates.dto";
import DB, { T } from "../../../database/index.schema";
import { IReportTemplate } from './report-templates.interface';
import HttpException from "../../exceptions/HttpException";
import { REPORT_TEMPLATES } from "../../../database/report_templates.schema";

class ReportTemplateService {
  // Insert a new report template
  public async Insertbyreport(data: ReportTemplateDTO): Promise<any> {
    try {
      const inserted = await DB(T.REPORT_TEMPLATES).insert(data).returning('*');
      return inserted[0];
    } catch (error) {
      console.error('Error inserting report template:', error);
      throw new Error('Failed to insert report template');
    }
  }

  // Retrieve all report templates
  public async getAll(): Promise<any[]> {
    return DB(REPORT_TEMPLATES)
      .select('*')
      .where({ is_deleted: false })
      .orderBy('created_at', 'desc');
  }

  // Update an existing report template
  public async update(id: number, data: Partial<any>): Promise<any> {
    try {
      const updated = await DB(T.REPORT_TEMPLATES)
        .where({ id })
        .update({
          ...data,
          updated_at: DB.fn.now(), // Optional: auto-update timestamp
        })
        .returning('*');

      if (updated.length === 0) {
        throw new Error('Report template not found or update failed');
      }

      return updated[0];
    } catch (error) {
      console.error('Error updating report template:', error);
      throw new Error('Failed to update report template');
    }
  }

  // Soft delete a report template
  public async delete(id: number, data: Partial<any>): Promise<any> {

    const deleted_at = new Date();

    const result = await DB(T.REPORT_TEMPLATES)
      .where({ id })
      .update({
        ...data,
        deleted_at,
      })
      .returning('*');

    return result[0];
  }

  // Fetch a report template by its ID
  public async getById(id: number): Promise<any | null> {
    if (!id) {
      throw new HttpException(400, " ID is required");
    }
    const report = await DB(T.REPORT_TEMPLATES)
      .where({ id, is_deleted: false })
      .select('*');
    return report || null;
  }

}

export default ReportTemplateService;