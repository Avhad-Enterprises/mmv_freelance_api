import 'dotenv/config';
import 'reflect-metadata';
import App from './app';

// Feature-based route imports
import usersRoutes from './features/user/user.routes';
import roleRoute from './features/role/role.routes';
import permissionRoute from './features/permission/permission.routes';
import projectstaskRoute from './features/projectstask/projectstask.routes';
import AppliedProjectsRoute from './features/applied_projects/applied_projects.routes';
import favoritesRoute from './features/favorites/favorites.routes';
import SavedprojectRoute from './features/saved_project/saved_project.routes';
import blogRoute from './features/blog/blog.routes';
import CmsRoute from './features/cms/cms.routes';
import faqRoute from './features/faq/faq.routes';
import SEORoute from './features/seo/seo.routes';
import PaymentRoute from './features/payment/payment.routes';
import dashboardRoute from './features/dashboard/dashboard.routes';
import AnalyticsRoute from './features/analytics/analytics.routes';
import ReportRoute from './features/report/report.routes';
import VisitorLogRoute from './features/visitor-log/visitor-log.routes';
import notificationRoute from './features/notification/notification.routes';
import supportTicketsRoute from './features/support-ticket/support-ticket.routes';
import EmailRoute from './features/email/email.routes';

// Phase 8: Infrastructure Features
import UploadRoute from './features/upload/upload.routes';
import WebhookRoute from './features/webhook/webhook.routes';
import LocationRoute from './features/location/location.routes';
import BrandingRoute from './features/branding/branding.routes';
import FirebaseAuthRoute from './features/firebase-auth/firebase-auth.routes';
import DocumentRoute from './features/document/document.routes';

// Phase 9: Remaining Features
import CategoryRoute from './features/category/category.routes';
import TagRoute from './features/tag/tag.routes';
import ReviewRoute from './features/review/review.routes';
import RobotsTxtRoute from './features/robots-txt/robots-txt.routes';
import EmcRoute from './features/emc/emc.routes';
import ReportTemplatesRoute from './features/report-templates/report-templates.routes';

// Legacy route imports (to be migrated)
// Removed: import TagsRoute from './routes/tags.routes'; - Now using feature-based
// Removed: import uploadtoaws from './routes/uploadtoaws.route'; - Now using feature-based
// Removed: import projects_taskRoute from './routes/projectstask.routes'; - Now using feature-based
// Removed: import AppliedProjectsRoute from './routes/applied_projects.route'; - Now using feature-based
// Removed: import blogRoute from './routes/blog.routes'; - Now using feature-based
// Removed: import categoryRoute from './routes/categories.routes'; - Now using feature-based
// Removed: import EMCRoute from './routes/emc.routes'; - Now using feature-based
// Removed: import favoritesRoute from './routes/favorites.routes'; - Now using feature-based
// Removed: import notificationRoute from './routes/notification.routes'; - Now using feature-based
// Removed: import permissionRoute from './routes/permission.routes'; - Now using feature-based
// Removed: import ReportsRoute from './routes/report_system.routes'; - Now using feature-based
// Removed: import roleRoute from './routes/role.routes'; - Now using feature-based
// Removed: import visitor_logsRoute from './routes/visitor_logs.routes'; - Now using feature-based
// Removed: import report_templatesRoute from './routes/report_templates.routes'; - Now using feature-based
// Removed: import ReviewRoute from './routes/review.route'; - Now using feature-based
// Removed: import supportTicketsRoute from './routes/support_tickets.route'; - Now using feature-based
// Removed: import faqRoute from './routes/faq.routes'; - Now using feature-based
// Removed: import PaymentRoute from './routes/payment.route'; - Now using feature-based
// Removed: import WebhookRoute from './routes/webhook.route'; - Now using feature-based
// Removed: import CmsRoute from './routes/cms.routes'; - Now using feature-based
import validateEnv from './utils/validateEnv';
// Removed: import SEORoute from './routes/SEO.routes'; - Now using feature-based
// Removed: import branding_assetsRoute from './routes/branding_assets.routes'; - Now using feature-based
// Removed: import analytics_settingsRoute from './routes/analytics_Settings.routes'; - Now using feature-based
// Removed: import subscribed_emailsRoute from './routes/subscribed_emails.routes'; - Now using feature-based
// Removed: import robotstxtRoutes from './routes/robotstxt.routes'; - Now using feature-based
// Removed: import SavedprojectRoute from './routes/saved_project.route'; - Now using feature-based
// Removed: import locationRoute from './routes/location.routes'; - Now using feature-based
// Removed: import dashboardRoute from './routes/dashboard.routes'; - Now using feature-based
// Validate .env variables
validateEnv();

// Instantiate App with all route classes
const app = new App([
    new usersRoutes(),
    new roleRoute(),
    new permissionRoute(),
    new projectstaskRoute(),
    new AppliedProjectsRoute(),
    new favoritesRoute(),
    new SavedprojectRoute(),
    new blogRoute(),
    new CmsRoute(),
    new faqRoute(),
    new SEORoute(),
    new PaymentRoute(),
    new dashboardRoute(),
    new AnalyticsRoute(),
    new ReportRoute(),
    new VisitorLogRoute(),
    // Removed: new TagsRoute(), - Now using feature-based
    // Removed: new uploadtoaws(), - Now using feature-based
    // Removed: new categoryRoute(), - Now using feature-based
    // Removed: new EMCRoute(), - Now using feature-based
    // Removed: new notificationRoute(), - Now using feature-based
    // Removed: new ReportsRoute(), - Now added above with feature-based routes
    // Removed: new roleRoute(), - Now added above with feature-based routes
    // Removed: new visitor_logsRoute(), - Now added above with feature-based routes
    // Removed: new robotstxtRoutes(), - Now using feature-based
    // Removed: new report_templatesRoute(), - Now using feature-based
    // Removed: new ReviewRoute(), - Now using feature-based
    // Removed: new supportTicketsRoute(), - Now using feature-based
    // Removed: new PaymentRoute(), - Now added above with feature-based routes
    // Removed: new WebhookRoute(), - Now using feature-based
    // Removed: new branding_assetsRoute(), - Now using feature-based
    // Removed: new analytics_settingsRoute(), - Now added above with feature-based routes
    // Removed: new subscribed_emailsRoute(), - Now using feature-based
    // Removed: new SEORoute(), - Now added above with feature-based routes
    // Removed: new CmsRoute(), - Now added above with feature-based routes
    // Removed: new SavedprojectRoute(), - Now added above with feature-based routes
    // Removed: new locationRoute(), - Now using feature-based
    // Feature-based routes (Phases 1-8)
    new notificationRoute(),
    new supportTicketsRoute(),
    new EmailRoute(),
    new UploadRoute(),
    new WebhookRoute(),
    new LocationRoute(),
    new BrandingRoute(),
    new FirebaseAuthRoute(),
    new DocumentRoute(),
    // Phase 9: Remaining Features
    new CategoryRoute(),
    new TagRoute(),
    new ReviewRoute(),
    new RobotsTxtRoute(),
    new EmcRoute(),
    new ReportTemplatesRoute(),
    // Removed: new dashboardRoute(), - Now added above with feature-based routes
]);

// Start server
app.listen();
