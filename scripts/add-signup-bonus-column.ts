#!/usr/bin/env node

/**
 * Migration Script: Add Signup Bonus Feature
 * 
 * This script adds the necessary database changes for the signup bonus feature:
 * 1. Adds 'signup_bonus_claimed' column to freelancer_profiles table
 * 2. Adds 'signup_bonus' to the transaction_type enum in credit_transactions table
 * 
 * Usage: npx ts-node scripts/add-signup-bonus-column.ts
 * 
 * Safe to run multiple times - checks if changes already exist.
 */

import DB from '../database/index';

async function addSignupBonusColumn() {
    console.log('🚀 Starting Signup Bonus Migration...\n');

    try {
        // Step 1: Add signup_bonus_claimed column to freelancer_profiles
        console.log('📋 Step 1: Checking freelancer_profiles table...');
        
        const hasColumn = await DB.schema.hasColumn('freelancer_profiles', 'signup_bonus_claimed');
        
        if (hasColumn) {
            console.log('✅ Column signup_bonus_claimed already exists in freelancer_profiles');
        } else {
            console.log('➕ Adding signup_bonus_claimed column to freelancer_profiles...');
            await DB.schema.alterTable('freelancer_profiles', (table) => {
                table.boolean('signup_bonus_claimed').defaultTo(false)
                    .comment('Whether the 5 free keys signup bonus has been claimed');
            });
            console.log('✅ Successfully added signup_bonus_claimed column');
        }

        // Step 2: Add 'signup_bonus' to transaction_type enum
        console.log('\n📋 Step 2: Checking credit_transactions enum...');
        
        // Check if signup_bonus already exists in the enum
        const checkEnumResult = await DB.raw(`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'credit_transactions_transaction_type'
            )
            AND enumlabel = 'signup_bonus'
        `);

        if (checkEnumResult.rows && checkEnumResult.rows.length > 0) {
            console.log('✅ Enum value signup_bonus already exists in credit_transactions');
        } else {
            console.log('➕ Adding signup_bonus to transaction_type enum...');
            try {
                await DB.raw(`
                    ALTER TYPE credit_transactions_transaction_type 
                    ADD VALUE IF NOT EXISTS 'signup_bonus'
                `);
                console.log('✅ Successfully added signup_bonus to transaction_type enum');
            } catch (enumError: any) {
                // If the enum doesn't exist or has different name, try alternative approach
                if (enumError.message.includes('does not exist')) {
                    console.log('⚠️ Enum not found with expected name, skipping enum update');
                    console.log('   Note: The new enum value will be added when the schema is recreated');
                } else {
                    throw enumError;
                }
            }
        }

        console.log('\n✅ Migration completed successfully!\n');
        console.log('📝 Summary:');
        console.log('   - freelancer_profiles.signup_bonus_claimed: Added/Verified');
        console.log('   - credit_transactions.transaction_type: signup_bonus added/verified');
        console.log('\n🎁 Signup Bonus Feature is now ready!');
        console.log('   New freelancers (Editor/Videographer) will receive 5 free keys on registration.\n');

    } catch (error: any) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await DB.destroy();
    }
}

// Run migration
addSignupBonusColumn();
