// Database seeder for roles, permissions, and role-permission mappings
// This module provides functions to seed the RBAC system

import DB from '../index.schema';
import { ROLE } from '../role.schema';
import { PERMISSION } from '../permission.schema';
import { ROLE_PERMISSION } from '../role_permission.schema';

// ========== ROLE DEFINITIONS ==========
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

// ========== PERMISSION DEFINITIONS ==========
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

  // ========== Payment Management ==========
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

// ========== ROLE-PERMISSION MAPPINGS ==========
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

// ========== SEEDING FUNCTIONS ==========

export async function seedRoles(): Promise<void> {
  console.log('🌱 Seeding roles...');
  
  // Check if roles already exist
  const existingRoles = await DB(ROLE).select('name');
  const existingRoleNames = existingRoles.map((r: any) => r.name);

  // Filter out roles that already exist
  const rolesToInsert = predefinedRoles.filter(
    (role) => !existingRoleNames.includes(role.name)
  );

  if (rolesToInsert.length === 0) {
    console.log('   ✅ All roles already exist');
    return;
  }

  // Insert new roles
  await DB(ROLE).insert(rolesToInsert);
  console.log(`   ✅ Inserted ${rolesToInsert.length} roles`);
}

export async function seedPermissions(): Promise<void> {
  console.log('🌱 Seeding permissions...');
  
  // Check if permissions already exist
  const existingPermissions = await DB(PERMISSION).select('name');
  const existingPermissionNames = existingPermissions.map((p: any) => p.name);

  // Filter out permissions that already exist
  const permissionsToInsert = predefinedPermissions.filter(
    (permission) => !existingPermissionNames.includes(permission.name)
  );

  if (permissionsToInsert.length === 0) {
    console.log('   ✅ All permissions already exist');
    return;
  }

  // Insert new permissions
  await DB(PERMISSION).insert(permissionsToInsert);
  console.log(`   ✅ Inserted ${permissionsToInsert.length} permissions`);
}

export async function seedRolePermissions(): Promise<void> {
  console.log('🌱 Seeding role-permission mappings...');
  
  // Get all roles and permissions
  const roles = await DB(ROLE).select('*');
  const permissions = await DB(PERMISSION).select('*');

  // Get existing mappings
  const existingMappings = await DB(ROLE_PERMISSION).select('*');

  let insertedCount = 0;

  for (const role of roles) {
    const rolePermissionNames = rolePermissionMappings[role.name as keyof typeof rolePermissionMappings];

    if (!rolePermissionNames) {
      continue;
    }

    // Special case: SUPER_ADMIN gets all permissions
    let permissionsToAssign: any[];
    if (rolePermissionNames.includes('*')) {
      permissionsToAssign = permissions;
    } else {
      permissionsToAssign = permissions.filter(p => 
        rolePermissionNames.includes(p.name)
      );
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

  console.log(`   ✅ Inserted ${insertedCount} role-permission mappings`);
}

export async function seedRBAC(): Promise<void> {
  console.log('\n🌱 Starting RBAC seeding...');
  await seedRoles();
  await seedPermissions();
  await seedRolePermissions();
  console.log('✅ RBAC seeding completed\n');
}