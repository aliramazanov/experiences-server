import { NextFunction, Request, Response } from "express";
import { Booking } from "../models/booking.model.js";
import { Experience } from "../models/experience.model.js";
import { User } from "../models/user.model.js";
import asyncErrorWrapper from "../utils/async-error-wrapper.js";
import BaseController from "./base.controller.js";

class BookingController {
  public createBooking = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { experienceId, userId, price, paid } = req.body;

      const experience = await Experience.findById(experienceId);
      const user = await User.findById(userId);

      if (!experience || !user) {
        return next(new Error("Experience or User not found"));
      }

      const bookingData = {
        experience: experienceId,
        user: userId,
        booking: "booking",
        price,
        paid,
      };

      const booking = BaseController.createOne(Booking)(req, res, next);
      res.status(201).json({
        status: "success",
        data: booking,
      });
    }
  );

  getBooking = BaseController.getOne(Booking);
  getAllBookings = BaseController.getAll(Booking);
  updateBooking = BaseController.updateOne(Booking);
  deleteBooking = BaseController.deleteOne(Booking);
}

export default new BookingController();
