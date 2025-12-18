// Script to seed role-permission mappings
// Usage: ts-node scripts/seed-role-permissions.ts
//
// This assigns permissions to roles based on the RBAC architecture

import DB from '../database/index';
import { ROLE } from '../database/role.schema';
import { PERMISSION } from '../database/permission.schema';
import { ROLE_PERMISSION } from '../database/role_permission.schema';

// Define role-permission mappings based on architecture
const rolePermissionMappings = {
  CLIENT: [
    // Profile management
    'profile.view',
    'profile.update',

    // Project management
    'projects.view',
    'projects.create',
    'projects.update',
    'projects.delete', // Own projects only
    'projects.hire',
    'projects.manage', // Own projects only

    // Applications
    'applications.view', // View applications for their projects

    // Reviews
    'reviews.view',
    'reviews.create',

    // Payments
    'payments.view', // Own payments only

    // Support
    'support.view',
    'support.create',
  ],

  VIDEOGRAPHER: [
    // Profile management
    'profile.view',
    'profile.update',

    // Project management
    'projects.view',
    'projects.apply',
    'projects.update', // Applied projects only
    'projects.withdraw', // Withdraw application

    // Applications
    'applications.view', // View their own applications

    // Reviews
    'reviews.view',
    'reviews.create',

    // Payments
    'payments.view', // Own payments only

    // Support
    'support.view',
    'support.create',
  ],

  VIDEO_EDITOR: [
    // Profile management
    'profile.view',
    'profile.update',

    // Project management
    'projects.view',
    'projects.apply',
    'projects.update', // Applied projects only
    'projects.withdraw',

    // Applications
    'applications.view',

    // Reviews
    'reviews.view',
    'reviews.create',

    // Payments
    'payments.view', // Own payments only

    // Support
    'support.view',
    'support.create',
  ],

  ADMIN: [
    // All basic permissions
    'profile.view',
    'profile.update',
    'profile.verify',

    // User management
    'users.view',
    'users.update',
    'users.ban',

    // Project management
    'projects.view',
    'projects.update',
    'projects.delete',
    'projects.manage',

    // Content management
    'content.view',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',

    // Reviews
    'reviews.view',
    'reviews.moderate',
    'reviews.delete',

    // Payments
    'payments.view',

    // Reports
    'reports.view',
    'reports.create',
    'reports.export',

    // Support
    'support.view',
    'support.create',
    'support.respond',
    'support.resolve',

    // Admin functions
    'admin.dashboard',
    'admin.analytics',
  ],

  SUPER_ADMIN: [
    // All permissions - will be assigned programmatically
    '*',
  ],
};

async function seedRolePermissions() {
  try {
    console.log('🌱 Starting role-permission mapping seeding...\n');

    // Get all roles and permissions
    const roles = await DB(ROLE).select('*');
    const permissions = await DB(PERMISSION).select('*');

    console.log(`📊 Found ${roles.length} roles and ${permissions.length} permissions\n`);

    // Get existing mappings
    const existingMappings = await DB(ROLE_PERMISSION).select('*');
    console.log(`📋 Existing mappings: ${existingMappings.length}\n`);

    let insertedCount = 0;

    for (const role of roles) {
      console.log(`\n🔧 Processing role: ${role.name} (${role.label})`);

      const rolePermissionNames = rolePermissionMappings[role.name as keyof typeof rolePermissionMappings];

      if (!rolePermissionNames) {
        console.log(`   ⚠️  No permission mappings defined for ${role.name}`);
        continue;
      }

      // Special case: SUPER_ADMIN gets all permissions
      let permissionsToAssign: any[];
      if (rolePermissionNames.includes('*')) {
        permissionsToAssign = permissions;
        console.log(`   🌟 Assigning ALL ${permissions.length} permissions (SUPER_ADMIN)`);
      } else {
        permissionsToAssign = permissions.filter(p =>
          rolePermissionNames.includes(p.name)
        );
        console.log(`   📝 Assigning ${permissionsToAssign.length} permissions`);
      }

      // Insert mappings that don't already exist
      for (const permission of permissionsToAssign) {
        const exists = existingMappings.some(
          m => m.role_id === role.role_id && m.permission_id === permission.permission_id
        );

        if (!exists) {
          await DB(ROLE_PERMISSION).insert({
            role_id: role.role_id,
            permission_id: permission.permission_id,
          });
          insertedCount++;
        }
      }
    }

    console.log('\n\n✅ Role-permission mapping completed!');
    console.log(`   Inserted: ${insertedCount} new mappings`);
    console.log(`   Total mappings: ${existingMappings.length + insertedCount}\n`);

    // Display summary by role
    console.log('📊 Permission Summary by Role:\n');
    for (const role of roles) {
      const mappings = await DB(ROLE_PERMISSION)
        .where({ role_id: role.role_id })
        .count('* as count')
        .first();
      console.log(`   ${role.name.padEnd(20)} → ${mappings?.count || 0} permissions`);
    }

    console.log('\n🎉 Seeding completed successfully!\n');

    await DB.destroy();
  } catch (error) {
    console.error('\n❌ Error seeding role-permissions:', error);
    await DB.destroy();
    process.exit(1);
  }
}

// Run the seeding
seedRolePermissions();
