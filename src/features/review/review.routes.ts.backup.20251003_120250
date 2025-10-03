import { Router } from 'express';
import validationMiddleware from '../../middlewares/validation.middleware';
import ReviewsController from './review.controller';
import { ReviewDto } from './review.dto';
import Route from '../../interfaces/routes.interface';

class ReviewRoute implements Route {
  public path = '/reviews';
  public router = Router();
  public reviewsController = new ReviewsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Submit a review (POST)
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(ReviewDto, 'body', false, ['create']),
      this.reviewsController.createReview
    );

    // Get reviews received by a freelancer (POST)
    this.router.post(
      `${this.path}/getreviews`,
      this.reviewsController.getReviews
    );

   

    // Soft delete a review (DELETE)
    this.router.delete(
      `${this.path}/delete`,
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
