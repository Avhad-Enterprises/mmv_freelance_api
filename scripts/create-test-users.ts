// Script to create test users for API testing
// Usage: npx ts-node scripts/create-test-users.ts

import DB from '../database/index.schema';
import { USERS_TABLE } from '../database/users.schema';
import { FREELANCER_PROFILES } from '../database/freelancer_profiles.schema';
import { VIDEOGRAPHER_PROFILES } from '../database/videographer_profiles.schema';
import { VIDEOEDITOR_PROFILES } from '../database/videoeditor_profiles.schema';
import bcrypt from 'bcrypt';
import { assignRole } from '../src/utils/rbac/role-checker';

interface TestUserOptions {
  email: string;
  password: string;
  role: 'VIDEOGRAPHER' | 'VIDEO_EDITOR';
  firstName: string;
  lastName: string;
}

async function createTestUser(options: TestUserOptions) {
  try {
    console.log(`🚀 Creating test ${options.role.toLowerCase()}...`);

    // Check if user already exists
    const existingUser = await DB(USERS_TABLE).where({ email: options.email }).first();
    if (existingUser) {
      console.log(`❌ User with email "${options.email}" already exists`);
      console.log(`User ID: ${existingUser.user_id}`);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(options.password, 10);

    // Create user
    console.log('👤 Creating user account...');
    const [user] = await DB(USERS_TABLE).insert({
      first_name: options.firstName,
      last_name: options.lastName,
      username: `${options.firstName.toLowerCase()}${options.lastName.toLowerCase()}`,
      email: options.email,
      password: hashedPassword,
      phone_number: '+1234567890',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    // Assign role
    console.log('🔐 Assigning role...');
    await assignRole(user.user_id, options.role);

    // Create freelancer profile
    console.log('📝 Creating freelancer profile...');
    const [freelancerProfile] = await DB(FREELANCER_PROFILES).insert({
      user_id: user.user_id,
      profile_title: `${options.role} Profile`,
      role: options.role,
      short_description: `Test ${options.role.toLowerCase()} for API testing`,
      experience_level: 'intermediate',
      skills: JSON.stringify(['test skill']),
      superpowers: JSON.stringify(['test superpower']),
      skill_tags: JSON.stringify(['test', 'api']),
      portfolio_links: JSON.stringify(['https://example.com']),
      rate_amount: 100.00,
      currency: 'USD',
      availability: 'part-time',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    // Create specific profile based on role
    if (options.role === 'VIDEOGRAPHER') {
      await DB(VIDEOGRAPHER_PROFILES).insert({
        freelancer_id: freelancerProfile.freelancer_id,
      });
    } else if (options.role === 'VIDEO_EDITOR') {
      await DB(VIDEOEDITOR_PROFILES).insert({
        freelancer_id: freelancerProfile.freelancer_id,
      });
    }

    console.log(`✅ Test ${options.role.toLowerCase()} created successfully`);
    console.log(`User ID: ${user.user_id}`);
    console.log(`Email: ${options.email}`);
    console.log(`Password: ${options.password}`);

    return user;

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

async function createTestUsers() {
  try {
    console.log('🧪 Creating test users for API testing...\n');

    // Create test videographer
    await createTestUser({
      email: 'test.videographer@example.com',
      password: 'TestPass123!',
      role: 'VIDEOGRAPHER',
      firstName: 'Test',
      lastName: 'Videographer'
    });

    console.log('');

    // Create test video editor
    await createTestUser({
      email: 'test.videoeditor@example.com',
      password: 'TestPass123!',
      role: 'VIDEO_EDITOR',
      firstName: 'Test',
      lastName: 'VideoEditor'
    });

    console.log('\n🎉 All test users created successfully!');

  } catch (error) {
    console.error('\n💥 Error creating test users:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  createTestUsers();
}