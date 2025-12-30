// To migrate this schema: npm run migrate:schema -- cascade_setup [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- cascade_setup
//    - Adds ON DELETE CASCADE constraints to orphaned tables
//
// 2. Drop and Recreate: npm run migrate:schema -- cascade_setup --drop
//    - NOT RECOMMENDED: This migration is structural, not a table create/drop
//
// Version: 1.0.0 - Fix Foreign Keys to support cascading deletions

import DB from '../database/index';
// Import table names
import { USERS_TABLE } from '../database/users.schema';
import { FAVORITES_TABLE } from '../database/favorites.schema';
import { REVIEWS_TABLE } from '../database/review.schema';
import { NOTIFICATION } from '../database/notification.schema';
import { TRANSACTION_TABLE } from '../database/transactions.schema';
import { PROJECTS_TASK } from '../database/projectstask.schema';
import { FREELANCER_PROFILES } from '../database/freelancer_profiles.schema';
import { CLIENT_PROFILES } from '../database/client_profiles.schema';

export const CASCADE_SETUP = 'cascade_setup';

export const migrate = async (dropFirst = false) => {
    try {
        console.log('Applying Cascading Deletes...');

        // 1. Favorites: Link user_id->users and freelancer_id->freelancer_profiles
        console.log(`Updating ${FAVORITES_TABLE}...`);

        // Cleanup orphans
        await DB.raw(`DELETE FROM ${FAVORITES_TABLE} WHERE user_id NOT IN (SELECT user_id FROM ${USERS_TABLE})`);
        await DB.raw(`DELETE FROM ${FAVORITES_TABLE} WHERE freelancer_id NOT IN (SELECT freelancer_id FROM ${FREELANCER_PROFILES})`);

        await DB.schema.alterTable(FAVORITES_TABLE, table => {
            // First drop existing constraints if any (to be safe, though likely none exist based on previous check)
            // Note: In knex/postgres, we rarely name them, but let's try to modify/add
            // Since we know they are currently just 'integers', we add FK.

            // user_id -> users(user_id) CASCADE
            table.foreign('user_id')
                .references('user_id')
                .inTable(USERS_TABLE)
                .onDelete('CASCADE');

            // freelancer_id -> freelancer_profiles(freelancer_id) CASCADE
            // Note: favorites.freelancer_id seems to track the profile ID
            table.foreign('freelancer_id')
                .references('freelancer_id')
                .inTable(FREELANCER_PROFILES)
                .onDelete('CASCADE');
        });

        // 2. Reviews: Link user_id, client_id, project_id
        console.log(`Updating ${REVIEWS_TABLE}...`);

        // Cleanup orphans
        await DB.raw(`DELETE FROM ${REVIEWS_TABLE} WHERE user_id NOT IN (SELECT user_id FROM ${USERS_TABLE})`);
        await DB.raw(`DELETE FROM ${REVIEWS_TABLE} WHERE client_id NOT IN (SELECT client_id FROM ${CLIENT_PROFILES})`);
        await DB.raw(`DELETE FROM ${REVIEWS_TABLE} WHERE project_id NOT IN (SELECT projects_task_id FROM ${PROJECTS_TASK})`);

        await DB.schema.alterTable(REVIEWS_TABLE, table => {
            // user_id -> users(user_id) CASCADE
            table.foreign('user_id')
                .references('user_id')
                .inTable(USERS_TABLE)
                .onDelete('CASCADE');

            // client_id -> client_profiles(client_id) CASCADE
            table.foreign('client_id')
                .references('client_id')
                .inTable(CLIENT_PROFILES)
                .onDelete('CASCADE');

            // project_id -> projects_task(projects_task_id) CASCADE
            table.foreign('project_id')
                .references('projects_task_id')
                .inTable(PROJECTS_TASK)
                .onDelete('CASCADE');
        });

        // 3. Notification: Link user_id
        console.log(`Updating ${NOTIFICATION}...`);

        // Cleanup orphans
        await DB.raw(`DELETE FROM ${NOTIFICATION} WHERE user_id NOT IN (SELECT user_id FROM ${USERS_TABLE})`);

        await DB.schema.alterTable(NOTIFICATION, table => {
            // user_id -> users(user_id) CASCADE
            table.foreign('user_id')
                .references('user_id')
                .inTable(USERS_TABLE)
                .onDelete('CASCADE');
        });

        // 4. Transactions: Fix existing RESTRICT constraints
        console.log(`Updating ${TRANSACTION_TABLE} (dropping old constraints if possible and adding cascade)...`);

        // Cleanup orphans
        await DB.raw(`DELETE FROM ${TRANSACTION_TABLE} WHERE payer_id IS NOT NULL AND payer_id NOT IN (SELECT user_id FROM ${USERS_TABLE})`);
        await DB.raw(`DELETE FROM ${TRANSACTION_TABLE} WHERE payee_id IS NOT NULL AND payee_id NOT IN (SELECT user_id FROM ${USERS_TABLE})`);

        // Complex part: We need to drop existing FKs.
        // Knex usually names them formatted as `${tablename}_${columnname}_foreign`.
        // Let's try raw SQL for safety to drop constraints if they exist, then re-add.

        // Payer
        await DB.schema.alterTable(TRANSACTION_TABLE, table => {
            table.dropForeign('payer_id');
        }).catch(err => console.log('Allowed fail: dropForeign payer_id', err.message));

        await DB.schema.alterTable(TRANSACTION_TABLE, table => {
            table.foreign('payer_id')
                .references('user_id')
                .inTable(USERS_TABLE)
                .onDelete('CASCADE');
        });

        // Payee
        await DB.schema.alterTable(TRANSACTION_TABLE, table => {
            table.dropForeign('payee_id');
        }).catch(err => console.log('Allowed fail: dropForeign payee_id', err.message));

        await DB.schema.alterTable(TRANSACTION_TABLE, table => {
            table.foreign('payee_id')
                .references('user_id')
                .inTable(USERS_TABLE)
                .onDelete('CASCADE');
        });

        console.log('Finished Applying Cascading Deletes');

    } catch (error) {
        console.error('Migration failed for cascade_setup:', error);
        throw error;
    }
};
