// User Profile Service
// Handles profile-related operations and checks
import DB, { T } from "../../../database/index";

/**
 * User Profile Service
 * Handles profile-related operations and checks
 */
class UserProfileService {

  /**
   * Check if user has any profile
   */
  public async userHasProfile(user_id: number): Promise<boolean> {
    // Check if user has any profile in profile tables
    const clientProfile = await DB(T.CLIENT_PROFILES).where({ user_id }).first();
    if (clientProfile) return true;

    const freelancerProfile = await DB(T.FREELANCER_PROFILES).where({ user_id }).first();
    if (freelancerProfile) return true;

    const adminProfile = await DB(T.ADMIN_PROFILES).where({ user_id }).first();
    if (adminProfile) return true;

    return false;
  }

  /**
   * Get user profile data based on role
   */
  public async getUserProfileData(user_id: number): Promise<any> {
    // Check client profile
    const clientProfile = await DB(T.CLIENT_PROFILES).where({ user_id }).first();
    if (clientProfile) {
      return { type: 'client', profile: clientProfile };
    }

    // Check freelancer profiles
    const freelancerProfile = await DB(T.FREELANCER_PROFILES).where({ user_id }).first();
    if (freelancerProfile) {
      // Check if videographer or video editor
      const videographerProfile = await DB(T.VIDEOGRAPHER_PROFILES).where({ freelancer_id: freelancerProfile.freelancer_id }).first();
      if (videographerProfile) {
        return { type: 'videographer', profile: { ...freelancerProfile, ...videographerProfile } };
      }

      const videoEditorProfile = await DB(T.VIDEOEDITOR_PROFILES).where({ freelancer_id: freelancerProfile.freelancer_id }).first();
      if (videoEditorProfile) {
        return { type: 'video_editor', profile: { ...freelancerProfile, ...videoEditorProfile } };
      }
    }

    // Check admin profile
    const adminProfile = await DB(T.ADMIN_PROFILES).where({ user_id }).first();
    if (adminProfile) {
      return { type: 'admin', profile: adminProfile };
    }

    return null;
  }

  /**
   * Update client profile
   */
  public async updateClientProfile(user_id: number, profileData: any): Promise<void> {
    await DB(T.CLIENT_PROFILES)
      .where({ user_id })
      .update({
        ...profileData,
        updated_at: DB.fn.now()
      });
  }

  /**
   * Update freelancer profile
   */
  public async updateFreelancerProfile(user_id: number, profileData: any): Promise<void> {
    await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .update({
        ...profileData,
        updated_at: DB.fn.now()
      });
  }

  /**
   * Update admin profile
   */
  public async updateAdminProfile(user_id: number, profileData: any): Promise<void> {
    await DB(T.ADMIN_PROFILES)
      .where({ user_id })
      .update({
        ...profileData,
        updated_at: DB.fn.now()
      });
  }
}

export default UserProfileService;