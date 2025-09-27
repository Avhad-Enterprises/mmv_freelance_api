import { userInfo } from "os";
import DB, { T } from "../database/index.schema";
import { USERS_TABLE } from "../database/users.schema";

class dashboardservice {

  //Signup users count last 24 hrs. 
  public async countNewSignupsLast24Hours(): Promise<number> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await DB(T.USERS_TABLE)
      .where('created_at', '>=', last24Hours)
      .count<{ count: string }[]>('* as count');

    return parseInt(result[0].count, 10) || 0;
  }

  // signup users details last 24 hrs.
  public async getSignupUsersLast24Hours(): Promise<any[]> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const users = await DB('users')
      .select('*')
      .where('created_at', '>=', last24Hours);

    return users;
  }

  // active projects count
  public async getActiveProjectTasks(): Promise<number> {
    const result = await DB('projects_task')
      .count('* as count')
      .where('is_active', 1)
      .first();

    return parseInt(String(result?.count ?? '0'), 10);
  }


  // total projects count
  public async countAllProjectTasks(): Promise<number> {
    const result = await DB(T.PROJECTS_TASK)
      .count<{ count: string }[]>('* as count');

    return parseInt(result[0].count, 10) || 0;
  }

  //admin overview robot.txt
  public checkRobotsTxtExists = async (): Promise<boolean> => {
    const result = await DB(T.ROBOTS_TXT).select('id').first();
    return !!result; // true if data exists, false otherwise
  }

  //overview branding_Assets logo 
  async getBrandingAssetsStatus(): Promise<string[] | null> {
    const row = await DB(T.BRANDING_ASSETS).select('*').first();

    if (!row) return null;

    const missing: string[] = []; // ✅ define here

    const fields = ['navbar_logo', 'navbar_logo_mobile', 'footer_logo', 'favicon'];

    for (const field of fields) {
      const value = row[field];
      console.log(`${field}: ${value}`);

      if (!this.isValidCDN(value)) {
        missing.push(field); // ✅ now it's defined and usable
      }
    }

    return missing;
  }

  private isValidCDN(url?: string): boolean {
    return typeof url === 'string'
      && url.trim() !== ''
      && url.startsWith('https://cdn.example.com/assets/');
  }

  //overview analytics_setting tracking_id count
  public async getAnalyticsStatus(): Promise<boolean | null> {
    const row = await DB(T.ANALYTICS_SETTINGS).select('tracking_id').first();

    if (!row) return null;

    const trackingId = row.tracking_id;

    // Check if tracking ID exists and is a valid format (like 'UA-XXXXX-Y')
    return typeof trackingId === 'string' && trackingId.trim() !== '';
  }

  // visitor logs last 24 hrs
  public countRecentVisitors = async (): Promise<number> => {
    const result = await DB(T.VISITOR_LOGS)
      .where('created_at', '>=', DB.raw("NOW() - INTERVAL '24 HOURS'"))
      .count<{ count: string }[]>('* as count');

    return parseInt(result[0].count, 10) || 0;
  }

  // customer service(T.support Ticket) unresolved tickets
  public countUnresolvedCustomerTickets = async (): Promise<number> => {
    const result = await DB(T.SUPPORT_TICKETS_TABLE)
      .where({ status: false })
      .count<{ count: string }[]>('* as count');
    return parseInt(result[0].count, 10) || 0;
  }

  //low website activity (empty projectsand projects_Task)
  public getActivityWarningsService = async () => {
    const warnings = [];

    // Count total records in projects_task table
    const taskCountResult = await DB(T.PROJECTS_TASK).count('* as count');
    const taskCount = Number(taskCountResult[0].count);

    // Warning if table is empty
    if (taskCount === 0) {
      warnings.push({
        type: 'low_activity_tasks',
        message: 'No project tasks have been created yet. Website activity is very low.',
        status: 'warning'
      });
    }

    return warnings;
  };

  //get payment warnings 
  public getPaymentWarnings = async () => {
    const warnings: any[] = [];

    // 1. Total payment count
    const paymentCountResult = await DB('payment').count('* as count');
    const paymentCount = Number(paymentCountResult[0]?.count || '0');

    if (paymentCount === 0) {
      warnings.push({
        type: 'no_payments',
        message: 'No payments have been recorded on the platform yet.',
        status: 'warning'
      });
    }

    // 2. Check pending payments
    const pendingPaymentsResult = await DB(T.TRANSACTION_TABLE)
      .where('status', 'pending')
      .sum('amount as total_pending');

    const totalPending = parseFloat(pendingPaymentsResult[0]?.total_pending || '0');

    if (totalPending > 0) {
      warnings.push({
        type: 'pending_payments',
        message: `There are pending payments totaling ₹${totalPending}.`,
        status: 'danger'
      });
    }

    // 3. Optional: Check payment gateway is configured
    const settings = await DB('site_settings').select('payment_gateway_key').first();
    if (!settings?.payment_gateway_key) {
      warnings.push({
        type: 'gateway_not_configured',
        message: 'Payment gateway is not configured.',
        status: 'warning'
      });
    }

    return warnings;
  };

  //security warnings (smtp issue, email domain not verified)
  public getSecurityWarningsService = async () => {
    const warnings = [];

    //Check if email domain is verified
    const domainCheckUser = await DB(USERS_TABLE)
      .whereNotNull('email')
      .first();

    if (domainCheckUser) {
      const email = domainCheckUser.email;
      const domain = email.split('@')[1];

      const allowedDomains = ['freelayncer.com', 'yourdomain.com']; // add your verified domains
      if (!allowedDomains.includes(domain)) {
        warnings.push({
          type: 'email_domain_unverified',
          message: `Email domain "${domain}" is not verified.`,
          status: 'warning',
        });
      }
    }

    return warnings;
  };

  // SEO configuration warnings
  public getSEOWarningsService = async () => {
    const warnings: string[] = [];

    const seoRecords = await DB(T.SEO).select('*').where({ is_deleted: false });

    if (!seoRecords.length) {
      warnings.push('No SEO metadata configured in the system.');
      return warnings;
    }

    for (const record of seoRecords) {
      if (!record.meta_title || !record.meta_description) {
        warnings.push(`Missing meta_title or meta_description for record ID ${record.id}`);
      }

      if (!record.og_title || !record.og_description || !record.og_image_url) {
        warnings.push(`Incomplete Open Graph data for record ID ${record.id}`);
      }

      if (!record.twitter_card || !record.twitter_title) {
        warnings.push(`Incomplete Twitter card data for record ID ${record.id}`);
      }

      if (!record.is_active) {
        warnings.push(`SEO record ID ${record.id} is inactive.`);
      }
    }

    return warnings;
  };


}


export default dashboardservice;

