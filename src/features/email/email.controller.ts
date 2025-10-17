import { NextFunction, Request, Response } from 'express';
import { SubscribedEmailDTO } from './email.dto';
import subscribedEmailservice from './email.service';

class SubscribedEmailsController {

  public subscribedEmailservice = new subscribedEmailservice();

  /**
   * Subscribes a new email address to the newsletter
   * Creates new subscription record with validated email.
   * Duplicate emails are prevented at the service level.
   */
  public insert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: SubscribedEmailDTO = req.body;
      const insertedData = await this.subscribedEmailservice.Insert(userData);
      res.status(201).json({ data: insertedData, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves all subscribed email addresses
   * Returns all active email subscriptions with their details.
   * Typically used in admin dashboard for managing subscribers.
   */
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