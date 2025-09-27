import DB, { T } from "../database/index.schema";
import { AnalyticsInterface } from '../interfaces/analytics_setting.interface';
import { AnalyticsDto } from '../dtos/analytics_settingss.dto';
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";

 class AnalyticsService {

  public async update(id: number, data: Partial<AnalyticsDto>): Promise<any> {
    if (!id) throw new HttpException(400, 'ID is required');
    if (!data || Object.keys(data).length === 0) throw new HttpException(400, 'Update data is empty');
  
    const updated = await DB(T.ANALYTICS_SETTINGS)
      .where({ id }) // or your table's primary key column
      .update(data);
  
    if (!updated || updated === 0) {
      throw new HttpException(404, 'analyticssettings not found or not updated');
    }
  
    return data;
  }
  
  public async getTrackingId(): Promise<AnalyticsInterface | null> {
    const result = await DB(T.ANALYTICS_SETTINGS)
      .orderBy('updated_at', 'desc')
      .first();

    return result || null;
  }
}
export default AnalyticsService;