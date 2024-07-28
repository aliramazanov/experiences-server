import { NextFunction, Request, Response } from "express";
import { Tour } from "../models/tourModel.js";
import APIFeatures from "../utils/api.js";
import ApplicationError from "../utils/error.js";
import asyncErrorWrapper from "../utils/catch.js";

class TourController {
  getAllTours = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const tours = await features.query;

      res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
          tours,
        },
      });
    }
  );

  getTour = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const tour = await Tour.findById(req.params.id).populate("reviews");

      if (!tour) {
        next(new ApplicationError("No tour found", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    }
  );

  createTour = asyncErrorWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const newTour = await Tour.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );

  updateTour = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!tour) {
        return next(new ApplicationError("No tour found", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    }
  );

  deleteTour = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const tour = await Tour.findByIdAndDelete(req.params.id);

      if (!tour) {
        return next(new ApplicationError("No tour found", 404));
      }

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );

  getTourStats = asyncErrorWrapper(
    async (_req: Request, res: Response): Promise<void> => {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
          $group: {
            _id: { $toUpper: "$difficulty" },
            numTours: { $sum: 1 },
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

      const plan = await Tour.aggregate([
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
            numTourStarts: { $sum: 1 },
            tours: { $push: "$name" },
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
          $sort: { numTourStarts: -1 },
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

export default new TourController();
