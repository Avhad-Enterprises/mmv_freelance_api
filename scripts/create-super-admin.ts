// Script to create a Super Admin user
// Usage: npx ts-node scripts/create-super-admin.ts

import DB from '../database/index.schema';
import { USERS_TABLE } from '../database/users.schema';
import { ADMIN_PROFILES } from '../database/admin_profiles.schema';
import bcrypt from 'bcrypt';
import { assignRole } from '../src/utils/rbac/role-checker';

interface CreateAdminOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

async function createSuperAdmin(options: CreateAdminOptions = {}) {
  try {
    console.log('🚀 Creating Super Admin...\n');

    // Default values
    const adminData = {
      firstName: options.firstName || 'Super',
      lastName: options.lastName || 'Admin',
      email: options.email || 'superadmin@mmv.com',
      password: options.password || 'SuperAdmin123!',
    };

    // Check if admin already exists
    const existingAdmin = await DB(USERS_TABLE).where({ email: adminData.email }).first();
    if (existingAdmin) {
      console.log(`❌ Admin user with email "${adminData.email}" already exists`);
      console.log(`User ID: ${existingAdmin.user_id}`);
      console.log(`Name: ${existingAdmin.first_name} ${existingAdmin.last_name}`);
      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // Create user
    console.log('👤 Creating user account...');
    const [user] = await DB(USERS_TABLE).insert({
      first_name: adminData.firstName,
      last_name: adminData.lastName,
      username: `${adminData.firstName.toLowerCase()}${adminData.lastName.toLowerCase()}`,
      email: adminData.email,
      password: hashedPassword,
      phone_number: null,
      phone_verified: false,
      email_verified: true,
      profile_picture: null,
      bio: null,
      timezone: null,
      address_line_first: null,
      address_line_second: null,
      city: null,
      state: null,
      country: null,
      pincode: null,
      latitude: null,
      longitude: null,
      is_active: true,
      is_banned: false,
      is_deleted: false,
      banned_reason: null,
      reset_token: null,
      reset_token_expires: null,
      login_attempts: 0,
      last_login_at: null,
      email_notifications: true,
    }).returning('*');

    console.log(`✅ User created with ID: ${user.user_id}`);

    // Assign SUPER_ADMIN role
    console.log('🔑 Assigning SUPER_ADMIN role...');
    await assignRole(user.user_id, 'SUPER_ADMIN');
    console.log('✅ SUPER_ADMIN role assigned');

    // Create admin profile
    console.log('📋 Creating admin profile...');
    await DB(ADMIN_PROFILES).insert({
      user_id: user.user_id,
    });
    console.log('✅ Admin profile created');

    // Success message
    console.log('\n🎉 Super Admin created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`User ID: ${user.user_id}`);
    
    console.log('\n🔐 Capabilities:');
    console.log('• Full platform access with all permissions');
    console.log('• Can create, update, delete users');
    console.log('• Can assign/remove roles from users');
    console.log('• Can manage all user types (clients, freelancers, admins)');
    console.log('• Can access admin dashboard and analytics');
    
    console.log('\n⚠️  Important: Change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  } finally {
    await DB.destroy();
  }
}

// Allow custom admin details via command line arguments
const args = process.argv.slice(2);
const options: CreateAdminOptions = {};

// Parse command line arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i];
  const value = args[i + 1];
  
  switch (key) {
    case '--email':
      options.email = value;
      break;
    case '--password':
      options.password = value;
      break;
    case '--first-name':
      options.firstName = value;
      break;
    case '--last-name':
      options.lastName = value;
      break;
  }
}

// Run the script
createSuperAdmin(options);

// Export for potential reuse
export { createSuperAdmin };