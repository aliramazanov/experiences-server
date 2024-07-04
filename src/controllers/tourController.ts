import { NextFunction, Request, Response } from "express";
import Tour from "../models/tourModel.js";
import APIFeatures from "../utils/api.js";
import ApplicationError from "../utils/error.js";
import asyncErrorWrapper from "../utils/catch.js";

const getAllTours = asyncErrorWrapper(
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

const getTour = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findById(req.params.id);
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

const createTour = asyncErrorWrapper(
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

const updateTour = asyncErrorWrapper(
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

const deleteTour = asyncErrorWrapper(
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

const getTourStats = asyncErrorWrapper(
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

const getMonthlyPlan = asyncErrorWrapper(
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

export {
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
};
