import { SubscribedEmailDTO } from "./email.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { SubscribedEmail } from './email.interface';

class subscribedEmailservice {
  /**
   * Creates new email subscription
   */
  public Insert = async (data: SubscribedEmailDTO): Promise<any> => {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }
    const res = await DB(T.SUBSCRIBED_EMAILS)
      .insert(data)
      .returning("*");
    return res[0];
  }

  /**
   * Retrieves all active email subscriptions
   */
  public getAll = async (): Promise<SubscribedEmail[]> => {
    try {
      const result = await DB(T.SUBSCRIBED_EMAILS)
        .where({ is_active: 1 })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching subscribed emails');
    }
  }

}
export default subscribedEmailservice;