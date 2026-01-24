// Migration script to add deleted_at timestamp column to users table
// Usage: npm run dev -- scripts/add-deleted-at-column.ts

import DB from '../database';

const addDeletedAtColumn = async () => {
    try {
        console.log('🔄 Checking if deleted_at column exists...');
        
        // Check if column already exists
        const hasColumn = await DB.schema.hasColumn('users', 'deleted_at');
        
        if (hasColumn) {
            console.log('✅ deleted_at column already exists in users table');
            return;
        }
        
        console.log('📝 Adding deleted_at column to users table...');
        
        await DB.schema.alterTable('users', (table) => {
            table.timestamp('deleted_at').nullable().comment('Timestamp when user was soft deleted');
        });
        
        console.log('✅ Successfully added deleted_at column to users table');
        
        // Optionally update existing deleted users
        const deletedUsersCount = await DB('users')
            .where('is_deleted', true)
            .whereNull('deleted_at')
            .count('user_id as count')
            .first();
            
        if (deletedUsersCount && Number(deletedUsersCount.count) > 0) {
            console.log(`📝 Updating ${deletedUsersCount.count} existing deleted users with current timestamp...`);
            
            await DB('users')
                .where('is_deleted', true)
                .whereNull('deleted_at')
                .update({
                    deleted_at: DB.fn.now()
                });
                
            console.log('✅ Updated existing deleted users');
        }
        
    } catch (error) {
        console.error('❌ Error adding deleted_at column:', error);
        throw error;
    } finally {
        await DB.destroy();
    }
};

// Run the migration
addDeletedAtColumn()
    .then(() => {
        console.log('🎉 Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    });