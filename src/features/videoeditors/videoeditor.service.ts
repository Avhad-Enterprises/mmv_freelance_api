// Video Editor Service - Specialized service for video editor operations
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import FreelancerService from "../freelancers/freelancer.service";

/**
 * Video Editor Service
 * Handles video editor-specific operations
 * Extends FreelancerService for shared freelancer functionality
 */
class VideoEditorService extends FreelancerService {
  
  /**
   * Get video editor with full profile (user + freelancer + videoeditor)
   */
  public async getVideoEditorProfile(user_id: number): Promise<any> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true, is_banned: false })
      .first();

    if (!user) {
      throw new HttpException(404, "Video editor not found");
    }

    // Verify user has VIDEO_EDITOR role
    const hasVideoEditorRole = await this.userHasRole(user_id, 'VIDEO_EDITOR');
    if (!hasVideoEditorRole) {
      throw new HttpException(403, "User is not a video editor");
    }

    // Get freelancer profile
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    // Get video editor-specific profile
    const videoEditorProfile = await DB(T.VIDEOEDITOR_PROFILES)
      .where({ profile_id: freelancerProfile.profile_id })
      .first();

    return {
      user,
      profile: {
        ...freelancerProfile,
        videoeditor: videoEditorProfile
      },
      userType: 'VIDEO_EDITOR'
    };
  }

  /**
   * Get all video editors
   */
  public async getAllVideoEditors(): Promise<any[]> {
    const videoEditors = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.VIDEOEDITOR_PROFILES, `${T.FREELANCER_PROFILES}.profile_id`, `${T.VIDEOEDITOR_PROFILES}.profile_id`)
      .where(`${T.ROLE}.name`, 'VIDEO_EDITOR')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.VIDEOEDITOR_PROFILES}.*`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return videoEditors;
  }

  /**
   * Update video editor-specific profile
   */
  public async updateVideoEditorProfile(
    user_id: number,
    profileData: any
  ): Promise<any> {
    // Verify user has VIDEO_EDITOR role
    const hasVideoEditorRole = await this.userHasRole(user_id, 'VIDEO_EDITOR');
    if (!hasVideoEditorRole) {
      throw new HttpException(403, "User is not a video editor");
    }

    // Get freelancer profile
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    // Update video editor-specific profile
    const updated = await DB(T.VIDEOEDITOR_PROFILES)
      .where({ profile_id: freelancerProfile.profile_id })
      .update({
        ...profileData,
        updated_at: DB.fn.now()
      })
      .returning("*");

    if (!updated.length) {
      throw new HttpException(404, "Video editor profile not found");
    }

    return updated[0];
  }

  /**
   * Get video editor by username
   */
  public async getVideoEditorByUsername(username: string): Promise<any> {
    const user = await DB(T.USERS_TABLE)
      .where({ username, is_active: true, is_banned: false })
      .first();

    if (!user) {
      throw new HttpException(404, "Video editor not found");
    }

    // Verify user has VIDEO_EDITOR role
    const hasVideoEditorRole = await this.userHasRole(user.user_id, 'VIDEO_EDITOR');
    if (!hasVideoEditorRole) {
      throw new HttpException(404, "User is not a video editor");
    }

    return this.getVideoEditorProfile(user.user_id);
  }

  /**
   * Search video editors by software proficiency
   */
  public async searchBySoftware(software: string): Promise<any[]> {
    const videoEditors = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.VIDEOEDITOR_PROFILES, `${T.FREELANCER_PROFILES}.profile_id`, `${T.VIDEOEDITOR_PROFILES}.profile_id`)
      .where(`${T.ROLE}.name`, 'VIDEO_EDITOR')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .whereRaw(`${T.FREELANCER_PROFILES}.skills::jsonb @> ?`, [JSON.stringify([software])])
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.VIDEOEDITOR_PROFILES}.*`
      )
      .orderBy(`${T.FREELANCER_PROFILES}.hourly_rate`, "asc");

    return videoEditors;
  }

  /**
   * Get top-rated video editors
   */
  public async getTopRated(limit: number = 10): Promise<any[]> {
    const videoEditors = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .leftJoin(T.VIDEOEDITOR_PROFILES, `${T.FREELANCER_PROFILES}.profile_id`, `${T.VIDEOEDITOR_PROFILES}.profile_id`)
      .where(`${T.ROLE}.name`, 'VIDEO_EDITOR')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.VIDEOEDITOR_PROFILES}.*`
      )
      .orderBy(`${T.FREELANCER_PROFILES}.hire_count`, "desc")
      .limit(limit);

    return videoEditors;
  }

  /**
   * Get available editors count for task assignment
   */
  public async getAvailableEditorsCount(): Promise<any[]> {
    const editors = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .leftJoin(T.PROJECTS_TASK, `${T.USERS_TABLE}.user_id`, `${T.PROJECTS_TASK}.editor_id`)
      .where(`${T.ROLE}.name`, 'VIDEO_EDITOR')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.user_id as editor_id`,
        `${T.USERS_TABLE}.*`,
        DB.raw('COALESCE(COUNT(??), 0) as task_count', [`${T.PROJECTS_TASK}.projects_task_id`])
      )
      .groupBy(`${T.USERS_TABLE}.user_id`)
      .orderBy('task_count', 'desc');

    return editors;
  }
}

export default VideoEditorService;
