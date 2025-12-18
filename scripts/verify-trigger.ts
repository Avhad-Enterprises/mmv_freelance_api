
import DB, { T } from '../database/index';
import { NOTIFICATION } from '../database/notification.schema';

const verifyTrigger = async () => {
    try {
        console.log('Verifying notification trigger...');
        const triggerExists = await DB.raw(`
            SELECT 1 
            FROM pg_trigger 
            WHERE tgname = 'trigger_new_notification' 
            AND tgrelid = '${NOTIFICATION}'::regclass
        `);

        if (triggerExists.rows.length > 0) {
            console.log('✅ Trigger "trigger_new_notification" exists.');
        } else {
            console.log('❌ Trigger "trigger_new_notification" DOES NOT exist.');
        }

        const functionExists = await DB.raw(`
            SELECT 1 
            FROM pg_proc 
            WHERE proname = 'notify_new_notification'
        `);

        if (functionExists.rows.length > 0) {
            console.log('✅ Function "notify_new_notification" exists.');
        } else {
            console.log('❌ Function "notify_new_notification" DOES NOT exist.');
        }

    } catch (error) {
        console.error('Error verifying trigger:', error);
    } finally {
        process.exit(0);
    }
};

verifyTrigger();
