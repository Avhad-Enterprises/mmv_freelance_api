import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import SubscribedEmailsController from './email.controller';
import { SubscribedEmailDTO } from './email.dto';

class subscribed_emailsRoute implements Route {

  public path = '/subscribed';
  public router = Router();
  public SubscribedEmailsController = new SubscribedEmailsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //subscribed_emails section  , validationMiddleware(SubscribedEmailDTO, 'body', false, [])
    this.router.post(`${this.path}/insert`, validationMiddleware(SubscribedEmailDTO, 'body', false, []), this.SubscribedEmailsController.insert);
    this.router.get(`${this.path}/getall`, this.SubscribedEmailsController.getallemails);

}
}

export default subscribed_emailsRoute;