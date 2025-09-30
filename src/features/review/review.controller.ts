import { NextFunction, Request, Response } from "express";
import { ReviewDto } from "./review.dto";
import ReviewsService from "./review.service";
import HttpException from "../../exceptions/HttpException";

class ReviewsController {
  public reviewsService = new ReviewsService();

    // POST /api/reviews/create
public createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviewData: ReviewDto = req.body; // DTO already validated and parsed

    const createdReview = await this.reviewsService.createReview(reviewData);

    res.status(201).json({
      data: createdReview,
      message: "Review submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

  // POST /api/reviews/getreviews
  public getReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { user_id } = req.body;
    if (!user_id || isNaN(parseInt(user_id))) {
      throw new HttpException(400, "Invalid or missing user_id");
    }

    const reviews = await this.reviewsService.getReviews(parseInt(user_id));
    res.status(200).json({
      data: reviews,
      message: `Fetched reviews for  ${user_id}`,
    });
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
