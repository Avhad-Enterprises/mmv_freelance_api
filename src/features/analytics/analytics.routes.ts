import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import AnalyticsController from './analytics.controller';
import { AnalyticsDto } from './analytics.dto';

class subscribed_emailsRoute implements Route {

  public path = '/analytics';
  public router = Router();
  public AnalyticsController  = new AnalyticsController ();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //subscribed_emails section  , validationMiddleware(SubscribedEmailDTO, 'body', false, [])
    this.router.post(`${this.path}/update`, validationMiddleware(AnalyticsDto, 'body', false, []), this.AnalyticsController.UpdateTrackingId);
    this.router.get(`${this.path}/getall`, this.AnalyticsController .getTrackingId);

}
}

export default subscribed_emailsRoute;