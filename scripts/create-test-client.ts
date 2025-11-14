import DB from '../database/index';
import { CLIENT_PROFILES } from '../database/client_profiles.schema';

async function createClientProfile() {
  try {
    const userId = 4; // Test client user ID

    // Check if profile already exists
    const existing = await DB(CLIENT_PROFILES).where({ user_id: userId }).first();
    if (existing) {
      console.log('Client profile already exists');
      return;
    }

    const [profile] = await DB(CLIENT_PROFILES).insert({
      user_id: userId,
      company_name: 'Test Client Company',
      website: 'https://example.com',
      company_description: 'Test client for API testing',
      industry: 'Technology',
      company_size: '1-10',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    console.log(`Client profile created with ID: ${profile.client_id}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createClientProfile();