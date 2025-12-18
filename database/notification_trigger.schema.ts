import DB, { T } from './index';

export const migrate = async (dropFirst = false) => {
    console.log('Using database:', process.env.DB_DATABASE);
    console.log('Running migration: Notification Trigger');

    try {
        // 1. Create the function that will be called by the trigger
        await DB.raw(`
      CREATE OR REPLACE FUNCTION notify_new_notification()
      RETURNS trigger AS $$
      BEGIN
        PERFORM pg_notify(
          'notification_created',
          json_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'title', NEW.title,
            'message', NEW.message,
            'type', NEW.type,
            'created_at', NEW.created_at
          )::text
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        console.log('✅ Function notify_new_notification created/updated');

        // 2. Drop the trigger if it exists (to strictly ensure we can recreate it)
        await DB.raw(`
      DROP TRIGGER IF EXISTS trigger_new_notification ON ${T.NOTIFICATION}
    `);

        // 3. Create the trigger
        await DB.raw(`
      CREATE TRIGGER trigger_new_notification
      AFTER INSERT ON ${T.NOTIFICATION}
      FOR EACH ROW
      EXECUTE PROCEDURE notify_new_notification();
    `);
        console.log('✅ Trigger trigger_new_notification created');

    } catch (error) {
        console.error('❌ Error creating notification trigger:', error);
        throw error;
    }
};
