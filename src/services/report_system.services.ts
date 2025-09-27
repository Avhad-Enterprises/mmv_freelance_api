import { ReportDto } from "../dtos/report_system.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { REPORT_TABLE } from "../database/report_system.schema";

class reportservices {
    public async reportsuser(dto: ReportDto): Promise<any> {
        // Check for duplicate report
        const query = DB(T.REPORT_TABLE)
            .where('reporter_id', dto.reporter_id)
            .andWhere('report_type', dto.report_type);

        if (dto.report_type === 'project' && dto.reported_project_id) {
            query.andWhere('reported_project_id', dto.reported_project_id);
        }

        const exists = await query.first();
        if (exists) throw new Error('Duplicate report not allowed.');

        const [inserted] = await DB(T.REPORT_TABLE)
            .insert({
                ...dto,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
                status: 'pending'
            })
            .returning('*');

        return inserted;
    }

    public async reportProject(dto: ReportDto): Promise<any> {
        // Prevent duplicate report by same user on same project
        const existing = await DB(T.REPORT_TABLE)
            .where({
                reporter_id: dto.reporter_id,
                report_type: 'project',
                reported_project_id: dto.reported_project_id
            })
            .andWhere({ is_deleted: false })
            .first();

        if (existing) {
            throw new Error('You have already reported this project.');
        }

        // Insert report
        const [inserted] = await DB(T.REPORT_TABLE)
            .insert({
                report_type: 'project',
                reporter_id: dto.reporter_id,
                reported_project_id: dto.reported_project_id,
                tags: dto.tags,
                notes: dto.notes,
                reason: dto.reason,
                description: dto.description,
                email: dto.email,
                created_by: dto.created_by,
                is_active: true,
                status: 'pending',
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('*');

        return inserted;
    }

    // Fetch a single report by its ID
    public async getReportById(report_id: number): Promise<any> {
        return DB(T.REPORT_TABLE)
            .where({ report_id, is_deleted: false })
            .first();
    }

  // Admin: Get all reports (user + project)
  public async getAllReports(): Promise<any[]> {
    return DB(T.REPORT_TABLE)
      .select(
        'report_id',
        'report_type',
        'reporter_id',
        'reported_project_id',
        'reason',
        'status',
        'admin_remarks',
        'created_at',
        'updated_at'
      )
      .where({ is_deleted: false })
      .orderBy('created_at', 'desc');
  }

  public async updateReportStatus(dto: ReportDto): Promise<number> {
    const updatedRows = await DB(T.REPORT_TABLE)
      .where({ report_id: dto.reporter_id, is_deleted: false })
      .update({
        status: dto.status,
        admin_remarks: dto.admin_remarks || null,
        reviewed_by: dto.reviewed_by,
        updated_by: dto.updated_by || null,
        updated_at: new Date()
      });

    return updatedRows; // Number of affected rows
  }



}

export default reportservices;
