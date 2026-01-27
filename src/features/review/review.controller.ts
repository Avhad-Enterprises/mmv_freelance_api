import { NextFunction, Request, Response } from "express";
import { ReviewDto } from "./review.dto";
import { RequestWithUser } from "../../interfaces/auth.interface";
import ReviewsService from "./review.service";
import HttpException from "../../exceptions/HttpException";

class ReviewsController {
  public reviewsService = new ReviewsService();

  // POST /api/reviews/create
  public createReview = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reviewData: ReviewDto = req.body; // DTO already validated and parsed

      // ✅ Security fix: Set reviewer user_id from JWT token instead of trusting client
      // The authenticated user is always the reviewer (client who gives the review)
      reviewData.client_id = req.user.user_id;

      const createdReview = await this.reviewsService.createReview(reviewData);

      res.status(201).json({
        data: createdReview,
        message: "Review submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/reviews/my-reviews - Get reviews received by the authenticated user
  public getMyReviews = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // ✅ Security fix: Use authenticated user's ID to get their reviews
      const user_id = req.user.user_id;

      const reviews = await this.reviewsService.getReviews(user_id);
      res.status(200).json({
        data: reviews,
        message: `Fetched reviews for authenticated user`,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/reviews/:user_id - Get reviews for a specific user (public/admin view)
  public getReviewsForUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user_id = parseInt(req.params.user_id as string);
      if (!user_id || isNaN(user_id)) {
        throw new HttpException(400, "Invalid user_id parameter");
      }

      const reviews = await this.reviewsService.getReviews(user_id);
      res.status(200).json({
        data: reviews,
        message: `Fetched reviews for user ${user_id}`,
      });
    } catch (error) {
      next(error);
    }
  };



  // POST /api/reviews/delete
  public deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { review_id } = req.body;
    if (!review_id || isNaN(parseInt(review_id))) {
      throw new HttpException(400, "Invalid or missing review_id");
    }

    await this.reviewsService.deleteReview(parseInt(review_id));
    res.status(200).json({
      message: "Review deleted successfully",
    });
  };
}

export default ReviewsController;
