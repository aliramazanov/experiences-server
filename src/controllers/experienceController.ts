import { NextFunction, Request, Response } from "express";
import BaseController from "../controllers/baseController.js";
import { Experience, IExperience } from "../models/experienceModel.js";
import asyncErrorWrapper from "../utils/catch.js";
import ApplicationError from "../utils/error.js";
import { convertDistanceToRadius } from "../utils/helpers.js";

class ExperienceController {
  public getAllExperiences = BaseController.getAll<IExperience>(Experience);

  public getExperience = BaseController.getOne<IExperience>(Experience, {
    path: "reviews",
  });

  public createExperience = BaseController.createOne<IExperience>(Experience);

  public updateExperience = BaseController.updateOne<IExperience>(Experience);

  public deleteExperience = BaseController.deleteOne<IExperience>(Experience);

  public getExperienceStats = asyncErrorWrapper(
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

  public getMonthlyPlan = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const year = Number.parseInt(req.params.year, 10);

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

  public getExperiencesWithinRadius = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { distance, latlong, unit } = req.params;
      const [lat, long] = latlong.split(",");

      if (!lat || !long) {
        return next(
          new ApplicationError(
            "Please provide latitude and longitude correctly",
            400
          )
        );
      }

      const radius = convertDistanceToRadius(distance, unit as "km" | "miles");

      const experiences = await Experience.find({
        startLocation: {
          $geoWithin: {
            $centerSphere: [[parseFloat(long), parseFloat(lat)], radius],
          },
        },
      });

      res.status(200).json({
        status: "success",
        results: experiences.length,
        data: {
          experiences,
        },
      });
    }
  );

  getDistancesOfExperiences = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { latlong, unit } = req.params;
      const [lat, long] = latlong.split(",");

      if (!lat || !long) {
        return next(
          new ApplicationError(
            "Please provide latitude and longitude correctly",
            400
          )
        );
      }

      const distances = await Experience.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(long), parseFloat(lat)],
            },
            distanceField: "distance",
            spherical: true,
            distanceMultiplier: unit === "km" ? 0.001 : 0.000621371,
          },
        },
      ]);

      res.status(200).json({
        status: "success",
        data: {
          distances,
        },
      });
    }
  );
}

export default new ExperienceController();
