import 'dotenv/config';
import 'reflect-metadata';
import App from './app';

// Feature-based route imports
// User & Auth routes (refactored with RBAC)
import { UserRoutes } from './features/user/user.routes';
import { AuthRoutes } from './features/auth/auth.routes';
import { ClientRoutes } from './features/clients/client.routes';
import { VideographerRoutes } from './features/videographers/videographer.routes';
import { VideoEditorRoutes } from './features/videoeditors/videoeditor.routes';

// RBAC routes
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

import validateEnv from './utils/validation/validateEnv';
// Validate .env variables
validateEnv();

// Instantiate App with all route classes
const app = new App([
    // Refactored routes with RBAC
    new UserRoutes(),
    new AuthRoutes(),
    new ClientRoutes(),
    new VideographerRoutes(),
    new VideoEditorRoutes(),
    
    // RBAC routes
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
    new notificationRoute(),
    new supportTicketsRoute(),
    new EmailRoute(),
    new UploadRoute(),
    new WebhookRoute(),
    new LocationRoute(),
    new BrandingRoute(),
    // new FirebaseAuthRoute(), // Temporarily disabled to avoid conflicts
    new DocumentRoute(),
    new CategoryRoute(),
    new TagRoute(),
    new ReviewRoute(),
    new RobotsTxtRoute(),
    new EmcRoute(),
    new ReportTemplatesRoute(),
]);

// Start server
(async () => {
  await app.listen();
})();

// Global error handlers to prevent app crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit the process, just log the error
  // process.exit(1); // Commented out to prevent crashes
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
  // process.exit(1); // Commented out to prevent crashes
});
