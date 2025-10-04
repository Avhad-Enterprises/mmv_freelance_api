// Quick script to check existing admin invitations
import DB, { T } from '../database/index.schema';

async function checkInvitations() {
  try {
    console.log('📋 Checking existing admin invitations...\n');

    const invitations = await DB(T.INVITATION_TABLE)
      .where('is_deleted', false)
      .orderBy('created_at', 'desc')
      .select('*');

    if (invitations.length === 0) {
      console.log('✅ No invitations found');
      return;
    }

    console.log(`Found ${invitations.length} invitation(s):\n`);

    invitations.forEach((invite, index) => {
      console.log(`${index + 1}. ${invite.first_name} ${invite.last_name} (${invite.email})`);
      console.log(`   Status: ${invite.status}`);
      console.log(`   Role: ${invite.assigned_role || 'None'}`);
      console.log(`   Token: ${invite.invite_token}`);
      console.log(`   Expires: ${new Date(invite.expires_at).toLocaleString()}`);
      console.log(`   Created: ${new Date(invite.created_at).toLocaleString()}\n`);
    });

  } catch (error) {
    console.error('❌ Error checking invitations:', error);
  } finally {
    process.exit(0);
  }
}

checkInvitations();