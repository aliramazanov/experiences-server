import { NextFunction, Request, Response } from "express";
import { IReview } from "../@types/review-schema-interface.js";
import { Review } from "../models/review.model.js";
import BaseController from "./base.controller.js";

class ReviewController {
  public setIds = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.body.experience) req.body.experience = req.params.experienceId;
    if (!req.body.user) req.body.user = (req as any).user.id;

    next();
  };

  public getAllReviews = BaseController.getAll<IReview>(Review);

  public getReview = BaseController.getOne<IReview>(Review);

  public createReview = BaseController.createOne<IReview>(Review);

  public updateReview = BaseController.updateOne<IReview>(Review);

  public deleteReview = BaseController.deleteOne<IReview>(Review);
}

export default new ReviewController();
