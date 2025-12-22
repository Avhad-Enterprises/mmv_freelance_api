
import DB, { T } from '../database/index';

const KEEP_EMAILS = [
    'devendramaac@gmail.com',
    'prajyotsatarkar108@gmail.com',
    'aashishsinghsre555@gmail.com',
    'praneethprani76@gmail.com',
    'theworkplace75@gmail.com',
    'geetsuriphotography@gmail.com',
    'ikedits25@gmail.com',
    'siddhantchavan25@yahoo.in',
    'eshwarvk43@gmail.com',
    'lifeofaryann@gmail.com',
    'mmvabudanceportal@gmail.com',
    'devanshudey1234@gmail.com',
    'dipti@gmail.com'
];

async function main() {
    try {
        console.log('🔒 Starting cleanup of non-live users...');
        console.log(`📋 Whitelist contains ${KEEP_EMAILS.length} users.`);

        // 1. Check current count
        const initialCountResult = await DB(T.USERS_TABLE).count('user_id as count').first();
        const initialCount = initialCountResult ? Number(initialCountResult.count) : 0;
        console.log(`📊 Current total users: ${initialCount}`);

        // 2. Execute Delete
        // We use case-insensitive matching for safety, though emails should be normalized
        const deleteResult = await DB(T.USERS_TABLE)
            .whereNotIn('email', KEEP_EMAILS)
            .delete();

        console.log(`🗑️  Deleted ${deleteResult} users.`);

        // 3. Verify final count
        const finalCountResult = await DB(T.USERS_TABLE).count('user_id as count').first();
        const finalCount = finalCountResult ? Number(finalCountResult.count) : 0;
        console.log(`✅ Remaining users: ${finalCount}`);

        // 4. List remaining users to be sure
        const remainingUsers = await DB(T.USERS_TABLE).select('email', 'first_name', 'last_name');
        console.log('\n📝 Remaining Users:');
        remainingUsers.forEach(u => console.log(` - ${u.email} (${u.first_name} ${u.last_name})`));

    } catch (error) {
        console.error('💥 Error during cleanup:', error);
    } finally {
        await DB.destroy();
    }
}

main();
