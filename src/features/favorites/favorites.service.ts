import { favoritesDto } from "./favorites.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { FAVORITES_TABLE } from "../../../database/favorites.schema";
import { application } from "express";

class favoritesservices {
  /**
   * Creates a new favorite relationship between client and freelancer
   */
  public async Insert(data: favoritesDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }

    // The frontend sends user_id as freelancer_id, but we need the actual freelancer_id from freelancer_profiles
    // Look up the freelancer profile using the user_id that was passed
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id: data.freelancer_id })
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    // Use the actual freelancer_id from the profile
    const actualFreelancerId = freelancerProfile.freelancer_id;

    // Check if already exists (including deleted records)
    const existing = await DB(T.FAVORITES_TABLE)
      .where({
        user_id: data.user_id,
        freelancer_id: actualFreelancerId
      })
      .first();

    if (existing && !existing.is_deleted) {
      throw new HttpException(409, "This freelancer is already in favorites");
    }

    // If previously deleted, reactivate it
    if (existing && existing.is_deleted) {
      const updated = await DB(T.FAVORITES_TABLE)
        .where({ id: existing.id })
        .update({
          is_deleted: false,
          deleted_by: null,
          deleted_at: null,
          is_active: true,
          updated_by: data.user_id,
          updated_at: new Date(),
        })
        .returning("*");
      return updated[0];
    }

    // Create new favorite with the actual freelancer_id
    const insertData = {
      ...data,
      freelancer_id: actualFreelancerId
    };
    const res = await DB(T.FAVORITES_TABLE).insert(insertData).returning("*");
    return res[0];
  }

  /**
   * Removes a favorite relationship
   */
  public async removeFavorite(dto: favoritesDto): Promise<string> {
    const { user_id, freelancer_id } = dto;

    // Look up the actual freelancer_id from freelancer_profiles
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id: freelancer_id })
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    const actualFreelancerId = freelancerProfile.freelancer_id;

    // Check if the favorite exists
    const existing = await DB(T.FAVORITES_TABLE)
      .where({ user_id, freelancer_id: actualFreelancerId, is_deleted: false })
      .first();

    if (!existing) {
      throw new HttpException(404, 'Favorite not found');
    }

    // Soft delete
    const deleted = await DB(T.FAVORITES_TABLE)
      .where({ user_id, freelancer_id: actualFreelancerId })
      .update({
        is_deleted: true,
        deleted_by: user_id,
        deleted_at: new Date(),
        updated_by: user_id,
        updated_at: new Date(),
      });

    if (deleted === 0) {
      throw new HttpException(500, 'Failed to remove favorite');
    }

    return 'Removed from favorites';
  }

  /**
   * Retrieves all favorite relationships
   */
  public async getFavoriteFreelancers(): Promise<any[]> {
    try {
      const result = await DB(T.FAVORITES_TABLE)
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching freelancers');
    }
  }

  /**
   * Gets all favorite freelancers for a specific user
   */
  public async getFavoritesByUser(user_id: number): Promise<any> {
    const favorites = await DB(T.FAVORITES_TABLE)
      .where({ user_id, is_active: true, is_deleted: false })
      .select("*")
      .orderBy('created_at', 'desc');

    return favorites;
  }

  /**
   * Gets detailed information about favorite freelancers
   */
  public async getfreelanceinfo(user_id: number): Promise<any[]> {
    if (!user_id) {
      throw new HttpException(400, "User ID is required");
    }

    const results = await DB(T.FAVORITES_TABLE)
      .where({
        [`${T.FAVORITES_TABLE}.user_id`]: user_id,
        [`${T.FAVORITES_TABLE}.is_deleted`]: false,
      })
      .leftJoin(
        `${T.USERS_TABLE}`,
        `${T.USERS_TABLE}.user_id`,
        '=',
        `${T.FAVORITES_TABLE}.freelancer_id` // Fixed: was incorrectly joining on id
      )
      .select(
        `${T.FAVORITES_TABLE}.*`,
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.first_name`,
        `${T.USERS_TABLE}.last_name`,
        `${T.USERS_TABLE}.profile_picture`,
        `${T.USERS_TABLE}.city`,
        `${T.USERS_TABLE}.country`,
      )
      .orderBy(`${T.FAVORITES_TABLE}.created_at`, 'desc');
    return results;
  }
}

export default favoritesservices;
