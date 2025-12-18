// Script to seed predefined permissions into the permission table
// Usage: ts-node scripts/seed-permissions.ts

import DB from '../database/index';
import { PERMISSION } from '../database/permission.schema';

interface PermissionData {
  name: string;
  label: string;
  module: string;
  description: string;
  is_critical: boolean;
}

const predefinedPermissions: PermissionData[] = [
  // ========== User Management ==========
  {
    name: 'users.view',
    label: 'View Users',
    module: 'users',
    description: 'View user profiles and information',
    is_critical: false,
  },
  {
    name: 'users.create',
    label: 'Create Users',
    module: 'users',
    description: 'Create new user accounts',
    is_critical: true,
  },
  {
    name: 'users.update',
    label: 'Update Users',
    module: 'users',
    description: 'Update user profiles and settings',
    is_critical: false,
  },
  {
    name: 'users.delete',
    label: 'Delete Users',
    module: 'users',
    description: 'Delete user accounts permanently',
    is_critical: true,
  },
  {
    name: 'users.ban',
    label: 'Ban Users',
    module: 'users',
    description: 'Ban or unban user accounts',
    is_critical: true,
  },

  // ========== Project Management ==========
  {
    name: 'projects.view',
    label: 'View Projects',
    module: 'projects',
    description: 'View project listings and details',
    is_critical: false,
  },
  {
    name: 'projects.create',
    label: 'Create Projects',
    module: 'projects',
    description: 'Create new project listings',
    is_critical: false,
  },
  {
    name: 'projects.update',
    label: 'Update Projects',
    module: 'projects',
    description: 'Update project details and status',
    is_critical: false,
  },
  {
    name: 'projects.delete',
    label: 'Delete Projects',
    module: 'projects',
    description: 'Delete project listings',
    is_critical: true,
  },
  {
    name: 'projects.apply',
    label: 'Apply to Projects',
    module: 'projects',
    description: 'Apply as a freelancer to projects',
    is_critical: false,
  },
  {
    name: 'projects.hire',
    label: 'Hire Freelancers',
    module: 'projects',
    description: 'Hire freelancers for projects',
    is_critical: false,
  },
  {
    name: 'projects.manage',
    label: 'Manage Projects',
    module: 'projects',
    description: 'Full project management access',
    is_critical: false,
  },
  {
    name: 'projects.withdraw',
    label: 'Withdraw Application',
    module: 'projects',
    description: 'Withdraw applied project application',
    is_critical: false,
  },

  // ========== Payment Management ==========
  {
    name: 'applications.view',
    label: 'View Applications',
    module: 'applications',
    description: 'View project applications',
    is_critical: false,
  },
  {
    name: 'payments.view',
    label: 'View Payments',
    module: 'payments',
    description: 'View payment records and transactions',
    is_critical: false,
  },
  {
    name: 'payments.process',
    label: 'Process Payments',
    module: 'payments',
    description: 'Process payment transactions',
    is_critical: true,
  },
  {
    name: 'payments.refund',
    label: 'Refund Payments',
    module: 'payments',
    description: 'Issue payment refunds',
    is_critical: true,
  },
  {
    name: 'payments.manage',
    label: 'Manage Payments',
    module: 'payments',
    description: 'Full payment management access',
    is_critical: true,
  },

  // ========== Content Management ==========
  {
    name: 'content.view',
    label: 'View Content',
    module: 'content',
    description: 'View CMS content and pages',
    is_critical: false,
  },
  {
    name: 'content.create',
    label: 'Create Content',
    module: 'content',
    description: 'Create new CMS content',
    is_critical: false,
  },
  {
    name: 'content.update',
    label: 'Update Content',
    module: 'content',
    description: 'Update existing CMS content',
    is_critical: false,
  },
  {
    name: 'content.delete',
    label: 'Delete Content',
    module: 'content',
    description: 'Delete CMS content',
    is_critical: true,
  },
  {
    name: 'content.publish',
    label: 'Publish Content',
    module: 'content',
    description: 'Publish or unpublish content',
    is_critical: false,
  },

  // ========== Reviews & Ratings ==========
  {
    name: 'reviews.view',
    label: 'View Reviews',
    module: 'reviews',
    description: 'View reviews and ratings',
    is_critical: false,
  },
  {
    name: 'reviews.create',
    label: 'Create Reviews',
    module: 'reviews',
    description: 'Create reviews and ratings',
    is_critical: false,
  },
  {
    name: 'reviews.moderate',
    label: 'Moderate Reviews',
    module: 'reviews',
    description: 'Moderate and manage reviews',
    is_critical: false,
  },
  {
    name: 'reviews.delete',
    label: 'Delete Reviews',
    module: 'reviews',
    description: 'Delete inappropriate reviews',
    is_critical: true,
  },

  // ========== Reports & Analytics ==========
  {
    name: 'reports.view',
    label: 'View Reports',
    module: 'reports',
    description: 'View system reports and analytics',
    is_critical: false,
  },
  {
    name: 'reports.create',
    label: 'Create Reports',
    module: 'reports',
    description: 'Create custom reports',
    is_critical: false,
  },
  {
    name: 'reports.export',
    label: 'Export Reports',
    module: 'reports',
    description: 'Export reports to various formats',
    is_critical: false,
  },

  // ========== Admin Functions ==========
  {
    name: 'admin.dashboard',
    label: 'Admin Dashboard',
    module: 'admin',
    description: 'Access admin dashboard',
    is_critical: false,
  },
  {
    name: 'admin.analytics',
    label: 'Admin Analytics',
    module: 'admin',
    description: 'View platform analytics and insights',
    is_critical: false,
  },
  {
    name: 'admin.settings',
    label: 'Admin Settings',
    module: 'admin',
    description: 'Manage platform settings and configuration',
    is_critical: true,
  },
  {
    name: 'admin.users',
    label: 'Manage Users',
    module: 'admin',
    description: 'Full user management capabilities',
    is_critical: true,
  },
  {
    name: 'admin.roles',
    label: 'Manage Roles',
    module: 'admin',
    description: 'Manage roles and permissions',
    is_critical: true,
  },
  {
    name: 'admin.audit',
    label: 'View Audit Logs',
    module: 'admin',
    description: 'View system audit logs',
    is_critical: false,
  },

  // ========== Support & Tickets ==========
  {
    name: 'support.view',
    label: 'View Support Tickets',
    module: 'support',
    description: 'View support tickets',
    is_critical: false,
  },
  {
    name: 'support.create',
    label: 'Create Support Tickets',
    module: 'support',
    description: 'Create new support tickets',
    is_critical: false,
  },
  {
    name: 'support.respond',
    label: 'Respond to Tickets',
    module: 'support',
    description: 'Respond to support tickets',
    is_critical: false,
  },
  {
    name: 'support.resolve',
    label: 'Resolve Tickets',
    module: 'support',
    description: 'Resolve and close support tickets',
    is_critical: false,
  },

  // ========== Profile Management ==========
  {
    name: 'profile.view',
    label: 'View Profile',
    module: 'profile',
    description: 'View own profile',
    is_critical: false,
  },
  {
    name: 'profile.update',
    label: 'Update Profile',
    module: 'profile',
    description: 'Update own profile information',
    is_critical: false,
  },
  {
    name: 'profile.verify',
    label: 'Verify Profile',
    module: 'profile',
    description: 'Verify user profiles and documents',
    is_critical: false,
  },
];

async function seedPermissions() {
  try {
    console.log('🌱 Starting permission seeding process...\n');

    // Check if permissions already exist
    const existingPermissions = await DB(PERMISSION).select('name');
    const existingPermissionNames = existingPermissions.map((p: any) => p.name);

    console.log('📊 Existing permissions:', existingPermissionNames.length);

    // Filter out permissions that already exist
    const permissionsToInsert = predefinedPermissions.filter(
      (permission) => !existingPermissionNames.includes(permission.name)
    );

    if (permissionsToInsert.length === 0) {
      console.log('\n✅ All predefined permissions already exist. No seeding needed.');
      await DB.destroy();
      return;
    }

    console.log(`\n📝 Inserting ${permissionsToInsert.length} new permissions...`);

    // Insert new permissions
    const insertedPermissions = await DB(PERMISSION).insert(permissionsToInsert).returning('*');

    console.log('\n✅ Successfully seeded permissions by module:');

    // Group by module for better display
    const permissionsByModule = insertedPermissions.reduce((acc: any, perm: any) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    Object.keys(permissionsByModule).sort().forEach((module) => {
      console.log(`\n   ${module.toUpperCase()}:`);
      permissionsByModule[module].forEach((perm: any) => {
        const criticalFlag = perm.is_critical ? '🔴' : '🟢';
        console.log(`   ${criticalFlag} ${perm.name} - ${perm.label}`);
      });
    });

    // Display summary
    console.log('\n📊 Permission Summary:');
    const allPermissions = await DB(PERMISSION).select('*');
    const criticalCount = allPermissions.filter((p: any) => p.is_critical).length;
    console.log(`   Total permissions: ${allPermissions.length}`);
    console.log(`   Critical permissions: ${criticalCount}`);
    console.log(`   Regular permissions: ${allPermissions.length - criticalCount}`);

    console.log('\n🎉 Permission seeding completed successfully!');

    await DB.destroy();
  } catch (error) {
    console.error('\n❌ Error seeding permissions:', error);
    await DB.destroy();
    process.exit(1);
  }
}

// Run the seeding
seedPermissions();
