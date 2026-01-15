import DB, { createProcedure } from './index';

export const MESSAGES_TABLE = 'messages';

export const MessagesSchema = `
  CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE} (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

export const migrate = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      await DB.raw(`DROP TABLE IF EXISTS ${MESSAGES_TABLE} CASCADE`);
    }

    await DB.raw(MessagesSchema);

    // Add trigger using the procedure
    await createProcedure();
    await DB.raw(`DROP TRIGGER IF EXISTS set_timestamp ON ${MESSAGES_TABLE}`);
    await DB.raw(`
        CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON ${MESSAGES_TABLE}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);

    console.log(`✅ Table ${MESSAGES_TABLE} created/updated successfully`);
  } catch (error) {
    console.error(`❌ Error in migrate for ${MESSAGES_TABLE}:`, error);
    throw error;
  }
};
