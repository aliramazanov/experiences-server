import { NextFunction, Request, Response } from "express";
import { Experience } from "../models/experienceModel.js";
import APIFeatures from "../utils/api.js";
import ApplicationError from "../utils/error.js";
import asyncErrorWrapper from "../utils/catch.js";

class ExperienceController {
  getAllExperiences = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const features = new APIFeatures(Experience.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const experiences = await features.query;

      res.status(200).json({
        status: "success",
        results: experiences.length,
        data: {
          experiences,
        },
      });
    }
  );

  getExperience = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const experience = await Experience.findById(req.params.id).populate(
        "reviews"
      );

      if (!experience) {
        next(new ApplicationError("No experiences found", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          experience,
        },
      });
    }
  );

  createExperience = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const newExperience = await Experience.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          experience: newExperience,
        },
      });
    }
  );

  updateExperience = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const experience = await Experience.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!experience) {
        return next(new ApplicationError("No experience found", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          experience,
        },
      });
    }
  );

  deleteExperience = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const experience = await Experience.findByIdAndDelete(req.params.id);

      if (!experience) {
        return next(new ApplicationError("No experience found", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );

  getExperienceStats = asyncErrorWrapper(
    async (_req: Request, res: Response): Promise<void> => {
      const stats = await Experience.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
          $group: {
            _id: { $toUpper: "$difficulty" },
            numExperiences: { $sum: 1 },
            numRatings: { $sum: "$ratingsQuantity" },
            avgRating: { $avg: "$ratingsAverage" },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
        {
          $sort: { avgPrice: 1 },
        },
      ]);

      res.status(200).json({
        status: "success",
        data: {
          stats,
        },
      });
    }
  );

  getMonthlyPlan = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const year = Number.parseInt(req.params.year, 10) * 1;

      const plan = await Experience.aggregate([
        {
          $unwind: "$startDates",
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$startDates" },
            numExperienceStarts: { $sum: 1 },
            experiences: { $push: "$name" },
          },
        },
        {
          $addFields: { month: "$_id" },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $sort: { numExperienceStarts: -1 },
        },
        {
          $limit: 12,
        },
      ]);

      res.status(200).json({
        status: "success",
        data: {
          plan,
        },
      });
    }
  );

  restrictRoles = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!roles.includes((req as any).user.role)) {
        return next(
          new ApplicationError(
            "Unauthorized action. You don't have enough permission",
            403
          )
        );
      }
      next();
    };
  };
}

export default new ExperienceController();
