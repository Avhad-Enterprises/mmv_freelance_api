import { VisitorLogDto } from "./visitor-log.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/util";

class VisitorService {
  public async logVisitor(data: any) {
    const [inserted] = await DB(T.VISITOR_LOGS).insert(data).returning('*');
    return inserted;
  }

  public async getVisitorStats() {
    const totalVisits = await DB(T.VISITOR_LOGS).count('id as count').first();

    const topPages = await DB(T.VISITOR_LOGS)
      .select('current_url')
      .count('id as views')
      .groupBy('current_url')
      .orderBy('views', 'desc')
      .limit(5);

    const totalCount = await DB(T.VISITOR_LOGS).count('id as count').first();
    const bounceRate = totalCount && totalCount.count

    const deviceDistribution = await DB(T.VISITOR_LOGS)
      .select('device_type')
      .count('id as count')
      .groupBy('device_type');

    const trafficSources = await DB(T.VISITOR_LOGS)
      .select('referrer_domain')
      .count('id as count')
      .groupBy('referrer_domain');

    return {
      totalVisits: totalVisits?.count ?? 0,
      topPages,
      deviceDistribution,
      trafficSources,
    };
  }

  public async getvisitorbytable(visitor_id: number): Promise<any> {
    try {
      if (!visitor_id) {
        throw new HttpException(400, "visitor_id is required");
      }
      const result = await DB(T.VISITOR_LOGS)
        .where({ visitor_id, is_active: true })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching Visitor');
    }
  }

  public async getallvisitorbytable(): Promise<any> {
    try {
      const result = await DB(T.VISITOR_LOGS)
        .where({ is_active: true, is_deleted: false })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching visitor');
    }
  }

  public async getallTableCounts(): Promise<any[]> {
    const result = await DB(T.VISITOR_LOGS)
      .select(
        "created_at",
        "visitor_type",
        "session_id"
      )
      .count("session_id as total_visitors")
      .avg("page_load_time as avg_page_load_time")
      .groupBy("created_at", "visitor_type", "session_id")
      .orderBy("created_at", "desc");

    return result;
  }

  public async searchAllVisitorLogs(query: string): Promise<any[]> {
    const tableName = T.VISITOR_LOGS;

    const sampleRow = await DB(tableName).first();
    const columnNames = sampleRow ? Object.keys(sampleRow) : [];

    const conditions = columnNames.map((col) => `CAST(${col} AS TEXT) ILIKE ?`).join(' OR ');
    const bindings = columnNames.map(() => `%${query}%`);

    const result = await DB(tableName)
      .whereRaw(conditions, bindings)
      .orderBy('created_at', 'desc')
      .limit(50);
    return result;
  }

  public async getbylogdate(start_date: string, end_date: string): Promise<any[]> {
    const tableName = T.VISITOR_LOGS;

    const sampleRow = await DB(tableName).first();
    const columnNames = sampleRow ? Object.keys(sampleRow) : [];

    const result = await DB(tableName)
      .whereBetween('created_at', [new Date(start_date), new Date(end_date)])
      .orderBy('created_at', 'desc')
      .limit(50);

    return result;
  }

  public async getvisitorbyweek(week: string): Promise<any[]> {
    const tableName = T.VISITOR_LOGS;

    const now = new Date();

    let startDate: Date;
    let endDate: Date = new Date();

    if (week === 'this_week') {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (week === 'last_week') {
      const dayOfWeek = now.getDay();
      const diffToLastMonday = dayOfWeek === 0 ? -13 : -6 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToLastMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      throw new Error('Invalid week option');
    }
    const result = await DB(tableName)
      .whereBetween('created_at', [startDate, endDate])
      .orderBy('created_at', 'desc')
      .limit(100);

    return result;
  }
  public async getvisitortimefilter(filter: string): Promise<any[]> {
    const tableName = T.VISITOR_LOGS;
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    switch (filter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;

      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'this_week': {
        const dayOfWeek = now.getDay() || 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case 'last_week': {
        const dayOfWeek = now.getDay() || 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;

      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;

      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;

      case 'this_quarter': {
        const currentMonth = now.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
        break;
      }

      case 'last_quarter': {
        const currentMonth = now.getMonth();
        const lastQuarterMonth = Math.floor((currentMonth - 3 + 12) / 3) * 3;
        const year = currentMonth < 3 ? now.getFullYear() - 1 : now.getFullYear();
        startDate = new Date(year, lastQuarterMonth, 1);
        endDate = new Date(year, lastQuarterMonth + 3, 0, 23, 59, 59, 999);
        break;
      }

      case 'last_3_months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_6_months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_12_months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_30_days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_15_days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 15);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_7_days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_3_years':
        startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_5_years':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last_10_years':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
        startDate.setHours(0, 0, 0, 0);
        break;

      default:
        throw new Error('Invalid time filter provided.');
    }

    const result = await DB(tableName)
      .whereBetween('created_at', [startDate, endDate])
      .orderBy('created_at', 'desc')
      .limit(100);

    return result;
  }

}
export default VisitorService;