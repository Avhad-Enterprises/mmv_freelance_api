import DB, { createProcedure } from './index';

export const CONVERSATIONS_TABLE = 'conversations';

export const ConversationsSchema = `
  CREATE TABLE IF NOT EXISTS ${CONVERSATIONS_TABLE} (
    id SERIAL PRIMARY KEY,
    participant1_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    participant2_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    last_message_text TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant1_id, participant2_id)
  );
`;

export const migrate = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      await DB.raw(`DROP TABLE IF EXISTS ${CONVERSATIONS_TABLE} CASCADE`);
    }

    await DB.raw(ConversationsSchema);

    // Add trigger using the procedure
    await createProcedure();
    await DB.raw(`DROP TRIGGER IF EXISTS set_timestamp ON ${CONVERSATIONS_TABLE}`);
    await DB.raw(`
        CREATE TRIGGER set_timestamp
        BEFORE UPDATE ON ${CONVERSATIONS_TABLE}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);

    console.log(`✅ Table ${CONVERSATIONS_TABLE} created/updated successfully`);
  } catch (error) {
    console.error(`❌ Error in migrate for ${CONVERSATIONS_TABLE}:`, error);
    throw error;
  }
};
