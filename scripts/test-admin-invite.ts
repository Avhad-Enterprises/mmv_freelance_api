// Test script to send admin invitation
// Usage: npx ts-node scripts/test-admin-invite.ts

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      user_id: number;
      email: string;
      first_name: string;
      last_name: string;
      username: string;
      roles: string[];
    };
    token: string;
  };
}

interface InviteResponse {
  data: {
    invitation_id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    assigned_role: string | null;
    invited_by: number;
    expires_at: string;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

async function testAdminInvite() {
  try {
    console.log('🚀 Testing Admin Invite Functionality\n');

    // Step 1: Login as Super Admin
    console.log('🔐 Logging in as Super Admin...');
    const loginResponse = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
      email: 'superadmin@mmv.com',
      password: 'SuperAdmin123!'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const { token, user } = loginResponse.data.data;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${user.first_name} ${user.last_name} (${user.email})`);
    console.log(`🔑 Roles: ${user.roles.join(', ')}\n`);

    // Step 2: Send invitation
    console.log('📧 Sending invitation to hmpatil371122@kkwagh.edu.in...');
    const inviteResponse = await axios.post<InviteResponse>(
      `${API_BASE_URL}/admin/invites`,
      {
        first_name: 'Harshal',
        last_name: 'Patil',
        email: 'hmpatil371122@kkwagh.edu.in',
        assigned_role: 'ADMIN',
        password: 'TempPass123!' // Optional temporary password
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Invitation sent successfully!');
    console.log('📋 Invitation Details:');
    console.log(`   ID: ${inviteResponse.data.data.invitation_id}`);
    console.log(`   Email: ${inviteResponse.data.data.email}`);
    console.log(`   Name: ${inviteResponse.data.data.first_name} ${inviteResponse.data.data.last_name}`);
    console.log(`   Role: ${inviteResponse.data.data.assigned_role || 'None'}`);
    console.log(`   Status: ${inviteResponse.data.data.status}`);
    console.log(`   Expires: ${new Date(inviteResponse.data.data.expires_at).toLocaleString()}`);
    console.log(`   Invited By: User ID ${inviteResponse.data.data.invited_by}`);

    console.log('\n📧 Check your email for the invitation link!');
    console.log('🔗 The invitation link will be in the format: /accept-invite?token=<token>');

    console.log('\n🎉 Test completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed:');

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.response.data}`);
    } else if (error.request) {
      console.error('   No response received from server');
      console.error('   Make sure the server is running on the correct port');
    } else {
      console.error(`   Error: ${error.message}`);
    }

    console.error('\n🔍 Troubleshooting:');
    console.error('1. Make sure the server is running: npm start');
    console.error('2. Check if Super Admin exists: npx ts-node scripts/create-super-admin.ts');
    console.error('3. Verify database connection and migrations');
  }
}

// Run the test
testAdminInvite();