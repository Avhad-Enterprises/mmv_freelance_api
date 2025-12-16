import knex from 'knex';
import dotenv from 'dotenv';
import 'reflect-metadata';


dotenv.config();

const awsConf = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_HOST === 'localhost' ? false : {
      rejectUnauthorized: false
    },
  },
  searchPath: 'public'
};

const DB = knex(awsConf);

export default DB;

// Table Names
import { USERS_TABLE } from './users.schema';
import { PROJECTS_TASK } from './projectstask.schema';
import { TAGS_TABLE } from './tags.schema';
import { APPLIED_PROJECTS } from './applied_projects.schema';
import { BLOG } from './blog.schema';
import { CATEGORY } from './category.schema';
import { FAVORITES_TABLE } from './favorites.schema';
import { NOTIFICATION } from './notification.schema';
import { PERMISSION } from './permission.schema';
import { REPORT_TABLE } from './report_system.schema';
import { ROLE } from './role.schema';
import { VISITOR_LOGS } from './visitor_logs.schema';
import { REVIEWS_TABLE } from './review.schema';
import { SUPPORT_TICKETS_TABLE } from './support_ticket.schema'
import { TICKET_REPLY_TABLE } from './support_ticket_reply.schema'
import { TICKET_NOTE_TABLE } from './support_ticket_note.schema'
import { ROBOTS_TXT } from './robotstxt.schema';
import { INVITATION_TABLE } from './admin_invites.schema';
import { REPORT_TEMPLATES } from './report_templates.schema';
import { ROLE_PERMISSION } from './role_permission.schema';
import { SUBMITTED_PROJECTS } from './submitted_projects.schema';
import { USER_ROLES } from './user_role.schema';
import { FAQ } from "./faq.schema";
import { TRANSACTION_TABLE } from "./transactions.schema";
import { CMS } from "./cms.schema";
import { SEO } from './seo.schema';
import { BRANDING_ASSETS } from './branding_assets.schema';
import { ANALYTICS_SETTINGS } from './analytics.schema';
import { SUBSCRIBED_EMAILS } from './subscribed_emails.schema';
import { SKILLS } from './skill.schema';
import { SAVED_PROJECTS } from './saved_project.schema';
import { EMAIL_LOG_TABLE } from './emailog.schema';

// New Profile Tables (Architecture Refactor)
import { FREELANCER_PROFILES } from './freelancer_profiles.schema';
import { VIDEOGRAPHER_PROFILES } from './videographer_profiles.schema';
import { VIDEOEDITOR_PROFILES } from './videoeditor_profiles.schema';
import { CLIENT_PROFILES } from './client_profiles.schema';
import { ADMIN_PROFILES } from './admin_profiles.schema';
import { CONTACT_SUBMISSIONS } from './contact.schema';
import { OAUTH_ACCOUNTS_TABLE } from './oauth_accounts.schema';


export const T = {
  USERS_TABLE,
  PROJECTS_TASK,
  TAGS_TABLE,
  APPLIED_PROJECTS,
  BLOG,
  CATEGORY,
  FAVORITES_TABLE,
  NOTIFICATION,
  PERMISSION,
  REPORT_TABLE,
  ROLE,
  VISITOR_LOGS,
  REVIEWS_TABLE,
  SUPPORT_TICKETS_TABLE,
  TICKET_REPLY_TABLE,
  TICKET_NOTE_TABLE,
  FAQ,
  USER_ROLES,
  SUBMITTED_PROJECTS,
  ROBOTS_TXT,
  INVITATION_TABLE,
  REPORT_TEMPLATES,
  ROLE_PERMISSION,
  TRANSACTION_TABLE,
  SKILLS,
  CMS,
  SEO,
  BRANDING_ASSETS,
  ANALYTICS_SETTINGS,
  SUBSCRIBED_EMAILS,
  SAVED_PROJECTS,
  EMAIL_LOG_TABLE,
  // New Profile Tables
  FREELANCER_PROFILES,
  VIDEOGRAPHER_PROFILES,
  VIDEOEDITOR_PROFILES,
  CLIENT_PROFILES,
  ADMIN_PROFILES,
  CONTACT_SUBMISSIONS,
  OAUTH_ACCOUNTS_TABLE,
};

// Creates the procedure that is then added as a trigger to every table
// Only needs to be run once on each postgres schema
export const createProcedure = async () => {
  await DB.raw(`
      CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
      LANGUAGE plpgsql
      AS
      $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;
    `);
};

// const run = async () => {
//   createProcedure();
// };
// run();
