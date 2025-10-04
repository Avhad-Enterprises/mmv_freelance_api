// Test script to accept admin invitation
// Usage: npx ts-node scripts/test-accept-invite.ts <token>

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

interface AcceptInviteResponse {
  data: {
    message: string;
    user_id: number;
  };
  message: string;
}

async function testAcceptInvite(token?: string) {
  try {
    console.log('🚀 Testing Accept Invitation Functionality\n');

    // Get token from command line or use a placeholder
    const inviteToken = token || process.argv[2];

    if (!inviteToken) {
      console.log('❌ No invitation token provided');
      console.log('Usage: npx ts-node scripts/test-accept-invite.ts <token>');
      console.log('\nTo get a token, check the email sent during invitation or run:');
      console.log('npx ts-node scripts/check-invitations.ts');
      console.log('\nThen look for the invite_token in the database.');
      process.exit(1);
    }

    console.log('🔑 Accepting invitation with token...');

    const acceptResponse = await axios.post<AcceptInviteResponse>(
      `${API_BASE_URL}/admin/invites/accept`,
      {
        token: inviteToken,
        new_password: 'NewSecurePass123!' // Optional: set a new password
      }
    );

    console.log('✅ Invitation accepted successfully!');
    console.log('👤 New user account created!');
    console.log(`   User ID: ${acceptResponse.data.data.user_id}`);
    console.log(`   Message: ${acceptResponse.data.data.message}`);

    console.log('\n🎉 User can now log in with their email and password!');

  } catch (error: any) {
    console.error('❌ Accept invitation test failed:');

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
    console.error('2. Verify the invitation token is valid and not expired');
    console.error('3. Check if the invitation hasn\'t already been accepted');
  }
}

// Run the test
testAcceptInvite();