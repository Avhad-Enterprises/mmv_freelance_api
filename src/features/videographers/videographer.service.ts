// Videographer Service - Specialized service for videographer operations
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import FreelancerService from "../freelancers/freelancer.service";

/**
 * Videographer Service
 * Handles videographer-specific operations
 * Extends FreelancerService for shared freelancer functionality
 */
class VideographerService extends FreelancerService {
  
  /**
   * Get videographer with full profile (user + freelancer + videographer)
   */
  public async getVideographerProfile(user_id: number): Promise<any> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true, is_banned: false })
      .first();

    if (!user) {
      throw new HttpException(404, "Videographer not found");
    }

    // Verify user has VIDEOGRAPHER role
    const hasVideographerRole = await this.userHasRole(user_id, 'VIDEOGRAPHER');
    if (!hasVideographerRole) {
      throw new HttpException(403, "User is not a videographer");
    }

    // Get freelancer profile
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    // Get videographer-specific profile
    const videographerProfile = await DB(T.VIDEOGRAPHER_PROFILES)
      .where({ freelancer_id: freelancerProfile.freelancer_id })
      .first();

    return {
      user,
      profile: {
        ...freelancerProfile,
        videographer: videographerProfile
      },
      userType: 'VIDEOGRAPHER'
    };
  }

  /**
   * Get all videographers
   */
  public async getAllVideographers(): Promise<any[]> {
    const videographers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.VIDEOGRAPHER_PROFILES, `${T.FREELANCER_PROFILES}.freelancer_id`, `${T.VIDEOGRAPHER_PROFILES}.freelancer_id`)
      .where(`${T.ROLE}.name`, 'VIDEOGRAPHER')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.VIDEOGRAPHER_PROFILES}.*`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return videographers;
  }

  /**
   * Update videographer-specific profile
   */
  public async updateVideographerProfile(
    user_id: number,
    profileData: any
  ): Promise<any> {
    // Verify user has VIDEOGRAPHER role
    const hasVideographerRole = await this.userHasRole(user_id, 'VIDEOGRAPHER');
    if (!hasVideographerRole) {
      throw new HttpException(403, "User is not a videographer");
    }

    // Get freelancer profile
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    // Update videographer-specific profile
    const updated = await DB(T.VIDEOGRAPHER_PROFILES)
      .where({ freelancer_id: freelancerProfile.freelancer_id })
      .update({
        ...profileData,
        updated_at: DB.fn.now()
      })
      .returning("*");

    if (!updated.length) {
      throw new HttpException(404, "Videographer profile not found");
    }

    return updated[0];
  }

  /**
   * Get videographer by username
   */
  public async getVideographerByUsername(username: string): Promise<any> {
    const user = await DB(T.USERS_TABLE)
      .where({ username, is_active: true, is_banned: false })
      .first();

    if (!user) {
      throw new HttpException(404, "Videographer not found");
    }

    // Verify user has VIDEOGRAPHER role
    const hasVideographerRole = await this.userHasRole(user.user_id, 'VIDEOGRAPHER');
    if (!hasVideographerRole) {
      throw new HttpException(404, "User is not a videographer");
    }

    return this.getVideographerProfile(user.user_id);
  }

  /**
   * Search videographers by availability
   */
  public async searchByAvailability(availability: string): Promise<any[]> {
    const videographers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.VIDEOGRAPHER_PROFILES, `${T.FREELANCER_PROFILES}.freelancer_id`, `${T.VIDEOGRAPHER_PROFILES}.freelancer_id`)
      .where(`${T.ROLE}.name`, 'VIDEOGRAPHER')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .where(`${T.FREELANCER_PROFILES}.availability`, availability)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.VIDEOGRAPHER_PROFILES}.*`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return videographers;
  }

  /**
   * Get top-rated videographers
   */
  public async getTopRated(limit: number = 10): Promise<any[]> {
    const videographers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.VIDEOGRAPHER_PROFILES, `${T.FREELANCER_PROFILES}.freelancer_id`, `${T.VIDEOGRAPHER_PROFILES}.freelancer_id`)
      .where(`${T.ROLE}.name`, 'VIDEOGRAPHER')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.VIDEOGRAPHER_PROFILES}.*`
      )
      .orderBy(`${T.FREELANCER_PROFILES}.hire_count`, "desc")
      .limit(limit);

    return videographers;
  }
}

export default VideographerService;
