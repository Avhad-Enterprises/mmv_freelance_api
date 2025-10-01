// Script to assign permissions to roles
// Usage: ts-node scripts/assign-role-permissions.ts

import DB from '../database/index.schema';
import { ROLE } from '../database/role.schema';
import { PERMISSION } from '../database/permission.schema';
import { ROLE_PERMISSION } from '../database/role_permission.schema';

// Define which permissions each role should have
const rolePermissionMap: { [roleName: string]: string[] } = {
  CLIENT: [
    // Projects
    'projects.view',
    'projects.create',
    'projects.update',
    'projects.delete',
    'projects.hire',
    'projects.manage',
    // Payments
    'payments.view',
    'payments.process',
    // Reviews
    'reviews.view',
    'reviews.create',
    // Support
    'support.view',
    'support.create',
    // Profile
    'profile.view',
    'profile.update',
  ],

  VIDEOGRAPHER: [
    // Projects
    'projects.view',
    'projects.apply',
    // Payments
    'payments.view',
    // Reviews
    'reviews.view',
    // Support
    'support.view',
    'support.create',
    // Profile
    'profile.view',
    'profile.update',
  ],

  VIDEO_EDITOR: [
    // Projects
    'projects.view',
    'projects.apply',
    // Payments
    'payments.view',
    // Reviews
    'reviews.view',
    // Support
    'support.view',
    'support.create',
    // Profile
    'profile.view',
    'profile.update',
  ],

  ADMIN: [
    // Users
    'users.view',
    'users.create',
    'users.update',
    'users.ban',
    // Projects
    'projects.view',
    'projects.update',
    'projects.delete',
    'projects.manage',
    // Payments
    'payments.view',
    'payments.manage',
    // Content
    'content.view',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',
    // Reviews
    'reviews.view',
    'reviews.moderate',
    'reviews.delete',
    // Reports
    'reports.view',
    'reports.create',
    'reports.export',
    // Admin
    'admin.dashboard',
    'admin.analytics',
    'admin.users',
    'admin.audit',
    // Support
    'support.view',
    'support.create',
    'support.respond',
    'support.resolve',
    // Profile
    'profile.view',
    'profile.update',
    'profile.verify',
  ],

  SUPER_ADMIN: [
    // All permissions - will be assigned dynamically
    '*',
  ],
};

async function assignRolePermissions() {
  try {
    console.log('🔐 Starting role-permission assignment process...\n');

    // Fetch all roles and permissions
    const roles = await DB(ROLE).select('role_id', 'name');
    const permissions = await DB(PERMISSION).select('permission_id', 'name');

    console.log(`📊 Found ${roles.length} roles and ${permissions.length} permissions`);

    // Create lookup maps
    const roleMap = new Map(roles.map((r: any) => [r.name, r.role_id]));
    const permissionMap = new Map(permissions.map((p: any) => [p.name, p.permission_id]));

    // Check existing assignments
    const existingAssignments = await DB(ROLE_PERMISSION).select('role_id', 'permission_id');
    const existingSet = new Set(
      existingAssignments.map((a: any) => `${a.role_id}-${a.permission_id}`)
    );

    console.log(`📊 Existing assignments: ${existingAssignments.length}\n`);

    let totalAssignments = 0;
    const assignmentsToInsert: Array<{ role_id: number; permission_id: number }> = [];

    // Process each role
    for (const [roleName, permissionNames] of Object.entries(rolePermissionMap)) {
      const roleId = roleMap.get(roleName);

      if (!roleId) {
        console.warn(`⚠️  Role "${roleName}" not found. Skipping...`);
        continue;
      }

      console.log(`🔧 Processing role: ${roleName}`);

      // Handle SUPER_ADMIN with all permissions
      const permissionsToAssign =
        permissionNames[0] === '*'
          ? Array.from(permissionMap.keys())
          : permissionNames;

      let newAssignments = 0;

      for (const permissionName of permissionsToAssign) {
        const permissionId = permissionMap.get(permissionName);

        if (!permissionId) {
          console.warn(`   ⚠️  Permission "${permissionName}" not found`);
          continue;
        }

        const assignmentKey = `${roleId}-${permissionId}`;

        if (!existingSet.has(assignmentKey)) {
          assignmentsToInsert.push({ role_id: roleId, permission_id: permissionId });
          newAssignments++;
        }
      }

      console.log(`   ✅ ${newAssignments} new permissions to assign`);
      totalAssignments += newAssignments;
    }

    if (assignmentsToInsert.length === 0) {
      console.log('\n✅ All role-permission assignments already exist. No changes needed.');
      await DB.destroy();
      return;
    }

    console.log(`\n📝 Inserting ${assignmentsToInsert.length} new role-permission assignments...`);

    // Insert new assignments
    await DB(ROLE_PERMISSION).insert(assignmentsToInsert);

    console.log('\n✅ Successfully assigned permissions to roles!');

    // Display summary
    console.log('\n📊 Assignment Summary:');
    for (const [roleName] of Object.entries(rolePermissionMap)) {
      const roleId = roleMap.get(roleName);
      if (roleId) {
        const count = await DB(ROLE_PERMISSION)
          .where({ role_id: roleId })
          .count('* as count')
          .first();
        console.log(`   ${roleName}: ${count?.count || 0} permissions`);
      }
    }

    console.log('\n🎉 Role-permission assignment completed successfully!');

    await DB.destroy();
  } catch (error) {
    console.error('\n❌ Error assigning role permissions:', error);
    await DB.destroy();
    process.exit(1);
  }
}

// Run the assignment
assignRolePermissions();
