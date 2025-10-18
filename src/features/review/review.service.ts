import { ReviewDto } from './review.dto';
import DB, { T } from '../../../database/index';
import HttpException from '../../exceptions/HttpException';
import { REVIEWS_TABLE } from '../../../database/review.schema';

class ReviewsService {
  // Create a review
  public async createReview(data: ReviewDto): Promise<any> {
    const { project_id, client_id, user_id, rating, review } = data;

    if (!project_id || !client_id || !user_id || !rating || !review) {
      throw new HttpException(400, 'All fields are required');
    }

    // Check if review already exists for this project and freelancer by the same client
    const existing = await DB(T.REVIEWS_TABLE)
      .where({ project_id, client_id, user_id, is_deleted: false })
      .first();

    if (existing) {
      throw new HttpException(409, 'Review already submitted');
    }

    const reviewData = {
      ...data,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    const created = await DB(T.REVIEWS_TABLE)
      .insert(reviewData)
      .returning('*');

    return created[0];
  }

  // Get reviews received 
 public async getReviews(user_id: number): Promise<any[]> {
  if (!user_id) {
    throw new HttpException(400, 'User ID is required');
  }

  const reviews = await DB(T.REVIEWS_TABLE)
    .join(`${T.USERS_TABLE}`, `${T.REVIEWS_TABLE}.client_id`, '=', `${T.USERS_TABLE}.user_id`)
    .where({
      [`${T.REVIEWS_TABLE}.user_id`]: user_id,
      [`${T.REVIEWS_TABLE}.is_deleted`]: false
    })
    .select(
      `${T.REVIEWS_TABLE}.*`,
      `${T.USERS_TABLE}.first_name as client_first_name`,
      `${T.USERS_TABLE}.last_name as client_last_name`,
      `${T.USERS_TABLE}.profile_picture as client_picture`
    )
    .orderBy(`${T.REVIEWS_TABLE}.created_at`, 'desc');

  return reviews;
}


  // Soft delete a review
  public async deleteReview(review_id: number): Promise<void> {
    if (!review_id) {
      throw new HttpException(400, 'Review ID is required');
    }

    const review = await DB(T.REVIEWS_TABLE)
      .where({ id: review_id })
      .first();

    if (!review) {
      throw new HttpException(404, 'Review not found');
    }

    if (review.is_deleted) {
      throw new HttpException(400, 'Review is already deleted');
    }

    await DB(T.REVIEWS_TABLE)
      .where({ id: review_id })
      .update({
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date()
      });
  }
}

export default ReviewsService;
