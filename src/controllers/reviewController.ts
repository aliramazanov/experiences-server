import { NextFunction, Request, Response } from "express";
import { IReview, Review } from "../models/reviewModel.js";
import asyncErrorWrapper from "../utils/catch.js";
import FactoryFunctions from "../controllers/factoryHandler.js";

class ReviewController {
  getAllReviews = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      let filter: any = {};
      if (req.params.experienceId)
        filter = { experience: req.params.experienceId };

      const reviews = await Review.find(filter);

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
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      if (!req.body.experience) req.body.experience = req.params.experienceId;
      if (!req.body.user) req.body.user = (req as any).user.id;

      const newReview = await Review.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          newReview,
        },
      });
    }
  );

  deleteReview = FactoryFunctions.deleteOne<IReview>(Review);
}

export default new ReviewController();
