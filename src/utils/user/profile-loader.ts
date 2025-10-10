// Profile Loader: Load user with their type-specific profile
// Automatically detects user type and loads appropriate profile

import DB from '../../../database/index.schema';
import { USERS_TABLE } from '../../../database/users.schema';
import { getUserRoles } from '../rbac/role-checker';

interface UserWithProfile {
  user: any;
  profile: any;
  userType: 'CLIENT' | 'VIDEOGRAPHER' | 'VIDEO_EDITOR' | 'ADMIN' | null;
}

/**
 * Load user with their appropriate profile based on role
 */
export const loadUserProfile = async (userId: number): Promise<UserWithProfile> => {
  // Get base user
  const user = await DB(USERS_TABLE).where({ user_id: userId }).first();
  
  if (!user) {
    throw new Error('User not found');
  }

  // Get user roles
  const roles = await getUserRoles(userId);
  
  // Determine primary user type (priority: CLIENT > VIDEOGRAPHER > VIDEO_EDITOR > ADMIN)
  let userType: 'CLIENT' | 'VIDEOGRAPHER' | 'VIDEO_EDITOR' | 'ADMIN' | null = null;
  let profile: any = null;

  if (roles.includes('CLIENT')) {
    userType = 'CLIENT';
    profile = await DB('client_profiles').where({ user_id: userId }).first();
  } else if (roles.includes('VIDEOGRAPHER')) {
    userType = 'VIDEOGRAPHER';
    // Load freelancer profile + videographer profile
    const freelancerProfile = await DB('freelancer_profiles').where({ user_id: userId }).first();
    if (freelancerProfile) {
      const videographerProfile = await DB('videographer_profiles')
        .where({ freelancer_id: freelancerProfile.freelancer_id })
        .first();
      profile = { ...freelancerProfile, videographer: videographerProfile };
    }
  } else if (roles.includes('VIDEO_EDITOR')) {
    userType = 'VIDEO_EDITOR';
    // Load freelancer profile + videoeditor profile
    const freelancerProfile = await DB('freelancer_profiles').where({ user_id: userId }).first();
    if (freelancerProfile) {
      const editorProfile = await DB('videoeditor_profiles')
        .where({ freelancer_id: freelancerProfile.freelancer_id })
        .first();
      profile = { ...freelancerProfile, videoeditor: editorProfile };
    }
  } else if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
    userType = 'ADMIN';
    profile = await DB('admin_profiles').where({ user_id: userId }).first();
  }

  return {
    user,
    profile,
    userType,
  };
};

/**
 * Check if profile exists for user
 */
export const hasProfile = async (userId: number, profileType: string): Promise<boolean> => {
  const table = `${profileType.toLowerCase()}_profiles`;
  
  if (profileType === 'VIDEOGRAPHER' || profileType === 'VIDEO_EDITOR') {
    const freelancerProfile = await DB('freelancer_profiles').where({ user_id: userId }).first();
    if (!freelancerProfile) return false;
    
    const specificTable = profileType === 'VIDEOGRAPHER' ? 'videographer_profiles' : 'videoeditor_profiles';
    const specificProfile = await DB(specificTable)
      .where({ freelancer_id: freelancerProfile.freelancer_id })
      .first();
    return !!specificProfile;
  }
  
  const profile = await DB(table).where({ user_id: userId }).first();
  return !!profile;
};
