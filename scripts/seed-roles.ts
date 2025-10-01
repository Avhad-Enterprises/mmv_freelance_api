// Script to seed predefined roles into the role table
// Usage: ts-node scripts/seed-roles.ts

import DB from '../database/index.schema';
import { ROLE } from '../database/role.schema';

interface RoleData {
  name: string;
  label: string;
  description: string;
  is_active: boolean;
}

const predefinedRoles: RoleData[] = [
  {
    name: 'CLIENT',
    label: 'Client',
    description: 'Business or individual hiring freelancers',
    is_active: true,
  },
  {
    name: 'VIDEOGRAPHER',
    label: 'Videographer',
    description: 'Video shooting professional',
    is_active: true,
  },
  {
    name: 'VIDEO_EDITOR',
    label: 'Video Editor',
    description: 'Video editing professional',
    is_active: true,
  },
  {
    name: 'ADMIN',
    label: 'Administrator',
    description: 'Platform administrator with management access',
    is_active: true,
  },
  {
    name: 'SUPER_ADMIN',
    label: 'Super Administrator',
    description: 'Full platform access with all permissions',
    is_active: true,
  },
];

async function seedRoles() {
  try {
    console.log('🌱 Starting role seeding process...\n');

    // Check if roles already exist
    const existingRoles = await DB(ROLE).select('name');
    const existingRoleNames = existingRoles.map((r: any) => r.name);

    console.log('📊 Existing roles:', existingRoleNames.length > 0 ? existingRoleNames : 'None');

    // Filter out roles that already exist
    const rolesToInsert = predefinedRoles.filter(
      (role) => !existingRoleNames.includes(role.name)
    );

    if (rolesToInsert.length === 0) {
      console.log('\n✅ All predefined roles already exist. No seeding needed.');
      await DB.destroy();
      return;
    }

    console.log(`\n📝 Inserting ${rolesToInsert.length} new roles...`);

    // Insert new roles
    const insertedRoles = await DB(ROLE).insert(rolesToInsert).returning('*');

    console.log('\n✅ Successfully seeded roles:');
    insertedRoles.forEach((role: any) => {
      console.log(`   • ${role.name} (${role.label}) - ${role.description}`);
    });

    // Display summary
    console.log('\n📊 Role Summary:');
    const allRoles = await DB(ROLE).select('*').where({ is_active: true });
    console.log(`   Total active roles: ${allRoles.length}`);
    
    console.log('\n🎉 Role seeding completed successfully!');

    await DB.destroy();
  } catch (error) {
    console.error('\n❌ Error seeding roles:', error);
    await DB.destroy();
    process.exit(1);
  }
}

// Run the seeding
seedRoles();
