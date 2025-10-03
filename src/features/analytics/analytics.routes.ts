import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import AnalyticsController from './analytics.controller';
import { AnalyticsDto } from './analytics.dto';
import { requireRole } from '../../middlewares/role.middleware';

class subscribed_emailsRoute implements Route {

  public path = '/analytics';
  public router = Router();
  public AnalyticsController  = new AnalyticsController ();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //subscribed_emails section  , validationMiddleware(SubscribedEmailDTO, 'body', false, [])
    this.router.post(`${this.path}/update`,
      requireRole('ADMIN', 'SUPER_ADMIN'), // Only admins can update analytics settings
      validationMiddleware(AnalyticsDto, 'body', false, []),
      this.AnalyticsController.UpdateTrackingId
    );
    
    this.router.get(`${this.path}/getall`,
      requireRole('ADMIN', 'SUPER_ADMIN'), // Only admins can view analytics settings
      this.AnalyticsController .getTrackingId
    );

}
}

export default subscribed_emailsRoute;