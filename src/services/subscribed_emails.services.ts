import { SubscribedEmailDTO } from "../dtos/subscribed_Emails.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { SubscribedEmail } from '../interfaces/subscribed_emails.interfaces';

class subscribedEmailservice {
  public Insert = async (data: SubscribedEmailDTO): Promise<any> => {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }
    const res = await DB(T.SUBSCRIBED_EMAILS)
    .insert(data)
    .returning("*");
    return res[0];
  }

  public getAll = async (): Promise<SubscribedEmail[]> => {
    try {
      const result = await DB(T.SUBSCRIBED_EMAILS)
        .where({ is_active: 1 })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching services');
    }
  }

}
export default subscribedEmailservice;