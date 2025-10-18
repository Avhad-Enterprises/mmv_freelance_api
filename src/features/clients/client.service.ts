// Client Service - Client-specific operations
import { ClientProfile } from './client.interface';
import DB, { T } from '../../../database/index';
import UserService from "../user/user.service";
import HttpException from '../../exceptions/HttpException';

/**
 * Client Service
 * Handles client-specific operations and profile management
 */
class ClientService extends UserService {
  
  /**
   * Get client with profile
   */
  public async getClientProfile(user_id: number): Promise<any> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true, is_banned: false })
      .first();

    if (!user) {
      throw new HttpException(404, "Client not found");
    }

    // Verify user has CLIENT role
    const hasClientRole = await this.userHasRole(user_id, 'CLIENT');
    if (!hasClientRole) {
      throw new HttpException(403, "User is not a client");
    }

    const profile = await DB(T.CLIENT_PROFILES)
      .where({ user_id })
      .first();

    return {
      user,
      profile,
      userType: 'CLIENT'
    };
  }

  /**
   * Update client profile
   */
  public async updateClientProfile(
    user_id: number, 
    profileData: any
  ): Promise<any> {
    // Verify user is a client
    const hasClientRole = await this.userHasRole(user_id, 'CLIENT');
    if (!hasClientRole) {
      throw new HttpException(403, "User is not a client");
    }

    // Check if profile exists
    const existingProfile = await DB(T.CLIENT_PROFILES)
      .where({ user_id })
      .first();

    if (!existingProfile) {
      throw new HttpException(404, "Client profile not found");
    }

    // Update profile
    const updated = await DB(T.CLIENT_PROFILES)
      .where({ user_id })
      .update({
        ...profileData,
        updated_at: DB.fn.now()
      })
      .returning("*");

    return updated[0];
  }

  /**
   * Get all clients
   */
  public async getAllClients(): Promise<any[]> {
    const clients = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .leftJoin(T.CLIENT_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.CLIENT_PROFILES}.user_id`)
      .where(`${T.ROLE}.name`, 'CLIENT')
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.CLIENT_PROFILES}.*`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return clients;
  }

  /**
   * Get client by company name
   */
  public async getClientByCompanyName(companyName: string): Promise<any> {
    const profile = await DB(T.CLIENT_PROFILES)
      .where('company_name', 'ilike', `%${companyName}%`)
      .first();

    if (!profile) {
      throw new HttpException(404, "Client not found");
    }

    const user = await this.getById(profile.user_id);

    return {
      user,
      profile,
      userType: 'CLIENT'
    };
  }

  /**
   * Search clients by industry
   */
  public async searchClientsByIndustry(industry: string): Promise<any[]> {
    const clients = await DB(T.USERS_TABLE)
      .join(T.USER_ROLES, `${T.USERS_TABLE}.user_id`, `${T.USER_ROLES}.user_id`)
      .join(T.ROLE, `${T.USER_ROLES}.role_id`, `${T.ROLE}.role_id`)
      .join(T.CLIENT_PROFILES, `${T.USERS_TABLE}.user_id`, `${T.CLIENT_PROFILES}.user_id`)
      .where(`${T.ROLE}.name`, 'CLIENT')
      .where(`${T.CLIENT_PROFILES}.industry`, industry)
      .where(`${T.USERS_TABLE}.is_active`, true)
      .where(`${T.USERS_TABLE}.is_banned`, false)
      .select(
        `${T.USERS_TABLE}.*`,
        `${T.CLIENT_PROFILES}.*`
      )
      .orderBy(`${T.USERS_TABLE}.created_at`, "desc");

    return clients;
  }

  /**
   * Update client business documents
   */
  public async updateBusinessDocuments(
    user_id: number,
    documentUrls: string[]
  ): Promise<any> {
    const hasClientRole = await this.userHasRole(user_id, 'CLIENT');
    if (!hasClientRole) {
      throw new HttpException(403, "User is not a client");
    }

    const updated = await DB(T.CLIENT_PROFILES)
      .where({ user_id })
      .update({
        business_documents: JSON.stringify(documentUrls),
        updated_at: DB.fn.now()
      })
      .returning("*");

    return updated[0];
  }

  /**
   * Get client statistics
   */
  public async getClientStats(user_id: number): Promise<any> {
    const profile = await DB(T.CLIENT_PROFILES)
      .where({ user_id })
      .first();

    if (!profile) {
      throw new HttpException(404, "Client profile not found");
    }

    return {
      projects_created: profile.projects_created || [],
      total_spent: profile.total_spent || 0,
      active_projects: Array.isArray(profile.projects_created) 
        ? profile.projects_created.length 
        : 0
    };
  }
}

export default ClientService;
