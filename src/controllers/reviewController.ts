import { NextFunction, Request, Response } from "express";
import BaseController from "../controllers/baseController.js";
import { IReview, Review } from "../models/reviewModel.js";
import asyncErrorWrapper from "../utils/catch.js";

class ReviewController {
  public setIds = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.body.experience) req.body.experience = req.params.experienceId;
    if (!req.body.user) req.body.user = (req as any).user.id;

    next();
  };

  public getAllReviews = asyncErrorWrapper(
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

  public getReview = BaseController.getOne<IReview>(Review);

  public createReview = BaseController.createOne<IReview>(Review);

  public updateReview = BaseController.updateOne<IReview>(Review);

  public deleteReview = BaseController.deleteOne<IReview>(Review);
}

export default new ReviewController();
