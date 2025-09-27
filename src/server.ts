import 'dotenv/config';
import 'reflect-metadata';
import App from './app';

// Route imports
import usersRoutes from './routes/users.route';
import TagsRoute from './routes/tags.routes';
import uploadtoaws from './routes/uploadtoaws.route';
import projects_taskRoute from './routes/projectstask.routes';
import AppliedProjectsRoute from './routes/applied_projects.route';
import blogRoute from './routes/blog.routes';
import categoryRoute from './routes/categories.routes';
import EMCRoute from './routes/emc.routes';
import favoritesRoute from './routes/favorites.routes';
import notificationRoute from './routes/notification.routes';
import permissionRoute from './routes/permission.routes';
import ReportsRoute from './routes/report_system.routes';
import roleRoute from './routes/role.routes';
import visitor_logsRoute from './routes/visitor_logs.routes';
import report_templatesRoute from './routes/report_templates.routes';
import ReviewRoute from './routes/review.route';
import supportTicketsRoute from './routes/support_tickets.route';
import faqRoute from './routes/faq.routes';
import PaymentRoute from './routes/payment.route';
import WebhookRoute from './routes/webhook.route';
import CmsRoute from './routes/cms.routes';
import validateEnv from './utils/validateEnv';
import SEORoute from './routes/SEO.routes';
import branding_assetsRoute from './routes/branding_assets.routes';
import analytics_settingsRoute from './routes/analytics_Settings.routes';
import subscribed_emailsRoute from './routes/subscribed_emails.routes';
import robotstxtRoutes from './routes/robotstxt.routes';
import SavedprojectRoute from './routes/saved_project.route';
import locationRoute from './routes/location.routes';
import dashboardRoute from './routes/dashboard.routes'
// Validate .env variables
validateEnv();

// Instantiate App with all route classes
const app = new App([
    new usersRoutes(),
    new TagsRoute(),
    new uploadtoaws(),
    new projects_taskRoute(),
    new AppliedProjectsRoute(),
    new blogRoute(),
    new categoryRoute(),
    new EMCRoute(),
    new favoritesRoute(),
    new notificationRoute(),
    new permissionRoute(),
    new ReportsRoute(),
    new roleRoute(),
    new visitor_logsRoute(),
    new robotstxtRoutes(),
    new report_templatesRoute(),
    new ReviewRoute(),
    new supportTicketsRoute(),
    new faqRoute(),
    new PaymentRoute(),
    new WebhookRoute(),
    new SEORoute(),
    new branding_assetsRoute(),
    new analytics_settingsRoute(),
    new subscribed_emailsRoute(),
    new WebhookRoute(),
    new CmsRoute(),
    new SavedprojectRoute(),
    new locationRoute(),
    new dashboardRoute()
]);

// Start server
app.listen();
