import { NextFunction, Request, Response } from 'express';
import { SubscribedEmailDTO } from '../dtos/subscribed_Emails.dto';
import subscribedEmailservice from '../services/subscribed_emails.services';

class SubscribedEmailsController  {

  public subscribedEmailservice = new subscribedEmailservice();

  public insert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

      const userData: SubscribedEmailDTO = req.body;
      const insertedData = await this.subscribedEmailservice.Insert(userData);
      res.status(201).json({ data: insertedData, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  };

  public getallemails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emails = await this.subscribedEmailservice.getAll();
      res.status(200).json({ data: emails, success: true });
    } catch (err) {
      next(err);
    }
  };

}

export default SubscribedEmailsController;