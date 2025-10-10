import { Router } from 'express';
import validationMiddleware from '../../middlewares/validation.middleware';
import authMiddleware from '../../middlewares/auth.middleware';
import ReviewsController from './review.controller';
import { ReviewDto } from './review.dto';
import Route from '../../interfaces/routes.interface';
import { requireRole } from '../../middlewares/role.middleware';

class ReviewRoute implements Route {
  public path = '/reviews';
  public router = Router();
  public reviewsController = new ReviewsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // ✅ Submit a review (POST) - authenticated client creates review
    this.router.post(
      `${this.path}/create`,
      authMiddleware,
      requireRole('CLIENT'), // Only clients can create reviews
      validationMiddleware(ReviewDto, 'body', false, ['create']),
      (req, res, next) => this.reviewsController.createReview(req as any, res, next)
    );

    // ✅ Get my reviews (GET) - authenticated user gets their reviews
    this.router.get(
      `${this.path}/my-reviews`,
      authMiddleware,
      (req, res, next) => this.reviewsController.getMyReviews(req as any, res, next)
    );

    // ✅ Get reviews for specific user (GET) - public/admin view by user_id param
    this.router.get(
      `${this.path}/user/:user_id`,
      requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All users can read reviews
      this.reviewsController.getReviewsForUser
    );

    // ✅ Soft delete a review (DELETE) - admin operation
    this.router.delete(
      `${this.path}/delete`,
      requireRole('CLIENT', 'ADMIN', 'SUPER_ADMIN'), // Clients and admins can delete reviews
      this.reviewsController.deleteReview
    );
  }
}

export default ReviewRoute;

// {
//   "project_id": 101,
//   "client_id": 5,
//   "user_id": 12,
//   "rating": 4,
//   "review": "Great work delivered on time and with excellent communication."
// }
