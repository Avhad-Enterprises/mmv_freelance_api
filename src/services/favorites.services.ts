import { favoritesDto } from "../dtos/favorites.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { FAVORITES_TABLE } from "../database/favorites.schema";
import { application } from "express";

class favoritesservices {

  public async Insert(data: favoritesDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }
    const existing = await DB(T.FAVORITES_TABLE)
      .where({
        user_id: data.user_id
        , freelancer_id: data.freelancer_id
      })
      .first();

    if (existing) {
      throw new HttpException(409, "This freelancer is already in favorites");
    }

    const res = await DB(T.FAVORITES_TABLE).insert(data).returning("*");
    return res[0];
  }



  public async removeFavorite(dto: favoritesDto): Promise<string> {
    const { id } = dto;

    const deleted = await DB(T.FAVORITES_TABLE)
      .where({ id: id })
      .del();

    if (deleted === 0) {
      throw new Error('Favorite not found.');
    }

    return 'Removed from favorites';
  }


  public async getFavoriteFreelancers(): Promise<any[]> {
    const result = await DB(T.FAVORITES_TABLE)
      .select("*");
    return result;
  } catch(error) {
    throw new Error('Error fetching freelancers');
  }



  public async getFavoritesByUser(user_id: number): Promise<any> {
    const favorites = await DB(T.FAVORITES_TABLE)
      .where({ user_id, is_active: true })
      .select("*");

    if (!favorites) throw new HttpException(404, "User not found");
    return favorites;
  }


  public async getfreelanceinfo(user_id: number): Promise<any[]> {

    if (!user_id) {
      throw new HttpException(400, "User ID is required");
    }
    console.log("User ID:", user_id); // Debugging line
    const results = await DB(T.FAVORITES_TABLE)
      .where({
        [`${T.FAVORITES_TABLE}.user_id`]: user_id,


      })
      .leftJoin(
        `${T.USERS_TABLE}`,
        `${T.USERS_TABLE}.user_id`,
        '=',
        `${T.FAVORITES_TABLE}.id`
      )
      .select(
        `${T.FAVORITES_TABLE}.*`,
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.skill`,
        `${T.USERS_TABLE}.city`,
        `${T.USERS_TABLE}.country`,
      );
    return results;
  }



}

export default favoritesservices;
