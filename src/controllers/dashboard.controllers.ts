import { NextFunction, Request, Response } from "express";
import dashboardservice from "../services/dashboard.services";

class dashboardcontroller {
  public dashboardservice = new dashboardservice();

  //Signup users count last 24 hrs. 
  public getNewSignupsLast24Hours = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.dashboardservice.countNewSignupsLast24Hours();
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error counting new signups:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // signup users details last 24 hrs.
  public getSignupUsersLast24Hours = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.dashboardservice.getSignupUsersLast24Hours();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching signup users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // active projects count
  public getActiveProjectTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const activeProjectCount = await this.dashboardservice.getActiveProjectTasks();
      res.status(200).json({ count: activeProjectCount });
    } catch (error) {
      console.error('Error fetching active project count:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // total projects count
  public countAllProjectTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.dashboardservice.countAllProjectTasks();
      res.status(200).json({ total: count });
    } catch (error) {
      console.error('Error counting project tasks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  //admin overview robot.txt
  public getRobotsTxt = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.dashboardservice.checkRobotsTxtExists();

      if (result) {
        res.status(200).json({ message: 'robots.txt data is present in the database' });
      } else {
        res.status(404).json({ message: 'robots.txt data not found in database' });
      }
    } catch (err) {
      console.error('robots.txt check error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  //overview branding_Assets logo 
  public getBrandingAssetsStatus = async (req: Request, res: Response) => {
    try {
      const missingAssets = await this.dashboardservice.getBrandingAssetsStatus();

      if (missingAssets === null) {
        res.status(404).json({ message: 'branding_assets data not found in database' });
      } else if (missingAssets.length > 0) {
        res.status(400).json({
          message: 'Some branding assets are missing',
          missing: missingAssets
        });
      } else {
        res.status(200).json({ message: 'All branding assets are present' });
      }
    } catch (error) {
      console.error('Branding asset check error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  //overview analytics_setting tracking_id count
  public getAnalyticsStatus = async (req: Request, res: Response) => {
    try {
      const result = await this.dashboardservice.getAnalyticsStatus();

      if (result === null) {
        res.status(404).json({ message: 'analytics_settings data not found in database' });
      } else if (!result) {
        res.status(400).json({ message: 'Analytics tracking ID is missing' });
      } else {
        res.status(200).json({ message: 'Analytics tracking ID is present' });
      }
    } catch (error) {
      console.error('Analytics check error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  // visitor logs last 24 hrs
  public getVisitorLogsOverview = async (req: Request, res: Response) => {
    const count = await this.dashboardservice.countRecentVisitors();
    res.status(200).json({ message: 'Visitors in last 24 hours', count });
  };

  // customer service(T.support Ticket) unresolved tickets
  public getCustomerServiceOverview = async (req: Request, res: Response) => {
    const count = await this.dashboardservice.countUnresolvedCustomerTickets();
    res.status(200).json({ message: 'Unresolved customer support tickets', count });
  };

  //low website activity (empty projectsand projects_Task using project_task table)
  public getActivityWarningsController = async (req: Request, res: Response) => {
    try {
      const warnings = await this.dashboardservice.getActivityWarningsService();
      res.status(200).json({
        success: true, warnings: warnings, "message": "No project tasks have been created yet. Website activity is very low.",
      });
    } catch (error) {
      console.error('Error fetching warnings:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

  //get payment warnings 
  public getPaymentWarningsController = async (req: Request, res: Response) => {
    try {
      const warnings = await this.dashboardservice.getPaymentWarnings();
      res.status(200).json({
        success: true,
        data: warnings
      });
    } catch (error) {
      console.error('Error getting payment warnings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment warnings.'
      });
    }
  };

  //security warnings (smtp issue, email domain not verified)
  public getsecurityWarningsController = async (req: Request, res: Response): Promise<void> => {
    try {
      const warnings = await this.dashboardservice.getSecurityWarningsService();
      res.status(200).json({
        success: true,
        message: 'Security warnings fetched successfully.',
        data: warnings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security warnings.',
        error: error.message,
      });
    }
  };

  // SEO configuration warnings
  public getSEOWarningsController = async (req: Request, res: Response) => {
    try {
      const warnings = await this.dashboardservice.getSEOWarningsService();
      res.status(200).json({ warnings });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch SEO warnings', error });
    }
  };


}
export default dashboardcontroller;





