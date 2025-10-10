// Freelancer Service - Base service for videographers and video editors
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import UserService from "../user/user.service";

/**
 * Freelancer Service
 * Base service for freelancer operations (shared by videographers and video editors)
 */
class FreelancerService extends UserService {
  
  /**
   * Get freelancer profile (base + freelancer profile)
   */
  public async getFreelancerProfile(user_id: number): Promise<any> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true, is_banned: false })
      .first();

    if (!user) {
      throw new HttpException(404, "Freelancer not found");
    }

    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    return {
      user,
      profile: freelancerProfile,
      userType: 'FREELANCER'
    };
  }

  /**
   * Update freelancer profile (common freelancer fields)
   */
  public async updateFreelancerProfile(
    user_id: number,
    profileData: any
  ): Promise<any> {
    const existingProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!existingProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    // Handle array fields that need to be stored as JSON
    const processedData = { ...profileData };
    const arrayFields = ['skills', 'portfolio_links', 'certifications', 'languages'];
    
    arrayFields.forEach(field => {
      if (processedData[field] && Array.isArray(processedData[field])) {
        processedData[field] = JSON.stringify(processedData[field]);
      }
    });

    const updated = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .update({
        ...processedData,
        updated_at: DB.fn.now()
      })
      .returning("*");

    return updated[0];
  }

  /**
   * Get all freelancers (videographers + video editors)
   */
  public async getAllFreelancers(): Promise<any[]> {
    const freelancers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .whereIn(`${T.ROLE}.name`, ['VIDEOGRAPHER', 'VIDEO_EDITOR'])
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.ROLE}.name as role_name`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return freelancers;
  }

  /**
   * Get all freelancers (public-safe version without email and phone)
   */
  public async getAllFreelancersPublic(): Promise<any[]> {
    const freelancers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .whereIn(`${T.ROLE}.name`, ['VIDEOGRAPHER', 'VIDEO_EDITOR'])
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        // User fields (excluding sensitive data)
        `${T.USERS_TABLE}.user_id`,
        `${T.USERS_TABLE}.first_name`,
        `${T.USERS_TABLE}.last_name`,
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.profile_picture`,
        `${T.USERS_TABLE}.bio`,
        `${T.USERS_TABLE}.timezone`,
        `${T.USERS_TABLE}.address_line_first`,
        `${T.USERS_TABLE}.address_line_second`,
        `${T.USERS_TABLE}.city`,
        `${T.USERS_TABLE}.state`,
        `${T.USERS_TABLE}.country`,
        `${T.USERS_TABLE}.pincode`,
        `${T.USERS_TABLE}.latitude`,
        `${T.USERS_TABLE}.longitude`,
        `${T.USERS_TABLE}.is_active`,
        `${T.USERS_TABLE}.is_banned`,
        `${T.USERS_TABLE}.is_deleted`,
        `${T.USERS_TABLE}.email_notifications`,
        `${T.USERS_TABLE}.created_at`,
        `${T.USERS_TABLE}.updated_at`,
        // Freelancer profile fields
        `${T.FREELANCER_PROFILES}.*`,
        // Role name
        `${T.ROLE}.name as role_name`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return freelancers;
  }

  /**
   * Search freelancers by skill
   */
  public async searchBySkill(skill: string): Promise<any[]> {
    const freelancers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .whereIn(`${T.ROLE}.name`, ['VIDEOGRAPHER', 'VIDEO_EDITOR'])
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .whereRaw(`${T.FREELANCER_PROFILES}.skills::jsonb @> ?`, [JSON.stringify([skill])])
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.ROLE}.name as role_name`
      )
      .orderBy(`${T.FREELANCER_PROFILES}.hourly_rate`, "asc");

    return freelancers;
  }

  /**
   * Search freelancers by hourly rate range
   */
  public async searchByHourlyRate(minRate: number, maxRate: number): Promise<any[]> {
    const freelancers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .whereIn(`${T.ROLE}.name`, ['VIDEOGRAPHER', 'VIDEO_EDITOR'])
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .whereBetween(`${T.FREELANCER_PROFILES}.hourly_rate`, [minRate, maxRate])
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.ROLE}.name as role_name`
      )
      .orderBy(`${T.FREELANCER_PROFILES}.hourly_rate`, "asc");

    return freelancers;
  }

  /**
   * Search freelancers by experience level
   */
  public async searchByExperienceLevel(level: string): Promise<any[]> {
    const freelancers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.FREELANCER_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.FREELANCER_PROFILES}.user_id`)
      .whereIn(`${T.ROLE}.name`, ['VIDEOGRAPHER', 'VIDEO_EDITOR'])
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .where(`${T.FREELANCER_PROFILES}.experience_level`, level)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.FREELANCER_PROFILES}.*`,
        `${T.ROLE}.name as role_name`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return freelancers;
  }

  /**
   * Update freelancer KYC verification status
   */
  public async updateKYCStatus(user_id: number, verified: boolean): Promise<any> {
    const updated = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .update({
        kyc_verified: verified,
        updated_at: DB.fn.now()
      })
      .returning("*");

    if (!updated.length) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    return updated[0];
  }

  /**
   * Get freelancer statistics
   */
  public async getFreelancerStats(user_id: number): Promise<any> {
    const profile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!profile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    return {
      hire_count: profile.hire_count || 0,
      total_earnings: profile.total_earnings || 0,
      time_spent: profile.time_spent || 0,
      projects_applied: profile.projects_applied || [],
      projects_completed: profile.projects_completed || []
    };
  }

  /**
   * Increment hire count
   */
  public async incrementHireCount(user_id: number): Promise<void> {
    await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .increment('hire_count', 1);
  }

  /**
   * Add to projects applied
   */
  public async addProjectApplied(user_id: number, projectId: number): Promise<void> {
    const profile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!profile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    const appliedProjects = profile.projects_applied || [];
    if (!appliedProjects.includes(projectId)) {
      appliedProjects.push(projectId);
      
      await DB(T.FREELANCER_PROFILES)
        .where({ user_id })
        .update({
          projects_applied: JSON.stringify(appliedProjects),
          updated_at: DB.fn.now()
        });
    }
  }

  /**
   * Add to projects completed
   */
  public async addProjectCompleted(user_id: number, projectId: number): Promise<void> {
    const profile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .first();

    if (!profile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    const completedProjects = profile.projects_completed || [];
    if (!completedProjects.includes(projectId)) {
      completedProjects.push(projectId);
      
      await DB(T.FREELANCER_PROFILES)
        .where({ user_id })
        .update({
          projects_completed: JSON.stringify(completedProjects),
          updated_at: DB.fn.now()
        });
    }
  }
   public async getAvailableFreelancers(): Promise<any[]> {
    const freelancers = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .leftJoin(T.PROJECTS_TASK, `${T.USERS_TABLE}.user_id`, `${T.PROJECTS_TASK}.editor_id`)
      .where(`${T.ROLE}.name`, 'FREELANCER')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.user_id as freelancer_id`,
        `${T.USERS_TABLE}.*`,
        DB.raw('COALESCE(COUNT(??), 0) as task_count', [`${T.PROJECTS_TASK}.projects_task_id`])
      )
      .groupBy(`${T.USERS_TABLE}.user_id`)
      .orderBy('task_count', 'desc');

    return freelancers;
  }
}

export default FreelancerService;
