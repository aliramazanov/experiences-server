import { Request, Response } from "express";
import Review from "../models/reviewModel.js";
import APIFeatures from "../utils/api.js";
import asyncErrorWrapper from "../utils/catch.js";

class ReviewController {
  getAllReviews = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const features = new APIFeatures(Review.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const reviews = await features.query;

      res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
          reviews,
        },
      });
    }
  );

  createReview = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const newReview = await Review.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          newReview,
        },
      });
    }
  );
}

export default new ReviewController();
