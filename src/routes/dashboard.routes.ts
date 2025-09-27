import { Router } from 'express';
import Route from '../interfaces/route.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import dashboardcontroller from '../controllers/dashboard.controllers';

class dashboardRoute implements Route {

  public path = '/dashboard';
  public router = Router();
  public dashboardcontroller = new dashboardcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //Signup users count last 24 hrs. 
    // this.router.get(`${this.path}/signup-count-last-24hrs`, this.dashboardcontroller.getNewSignupsLast24Hours);
    this.router.get(`${this.path}/signup-count-last-24hrs`, (req, res, next) => this.dashboardcontroller.getNewSignupsLast24Hours(req, res));

    // signup users details last 24 hrs.
    this.router.get(`${this.path}/signup-detail-last-24hrs`, this.dashboardcontroller.getSignupUsersLast24Hours);

    // active projects count
    this.router.get(`${this.path}/get-active-projects`, this.dashboardcontroller.getActiveProjectTasks);

    // total projects count
    this.router.get(`${this.path}/count-all`, this.dashboardcontroller.countAllProjectTasks);

    //admin overview robot.txt
    this.router.get(`${this.path}/robots-txt`, this.dashboardcontroller.getRobotsTxt);

    //overview branding_Assets logo 
    this.router.get(`${this.path}/branding-status`, this.dashboardcontroller.getBrandingAssetsStatus);

    //overview analytics_setting tracking_id count
    this.router.get(`${this.path}/analytics-status`, this.dashboardcontroller.getAnalyticsStatus);

    // visitor logs last 24 hrs
    this.router.get(`${this.path}/visitor-logs-overview`, this.dashboardcontroller.getVisitorLogsOverview);

    // customer service(T.support Ticket) unresolved tickets
    this.router.get(`${this.path}/customer-service-overview`, this.dashboardcontroller.getCustomerServiceOverview);

    //low website activity (empty projectsand projects_Task)
    this.router.get(`${this.path}/activity-warnings`, this.dashboardcontroller.getActivityWarningsController);

    //get payment warnings (transaction_table use)
    this.router.get(`${this.path}/payment-warnings`, this.dashboardcontroller.getPaymentWarningsController);

    //security warnings (email domain not verified)
    this.router.get(`${this.path}/security-warnings`, this.dashboardcontroller.getsecurityWarningsController);

    // SEO configuration warnings
    this.router.get(`${this.path}/seo-warnings`, this.dashboardcontroller.getSEOWarningsController);

  }
}

export default dashboardRoute;
