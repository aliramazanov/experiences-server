import mongoose, { Model, Schema } from "mongoose";
import { IBooking } from "../@types/booking-schema-interface.js";

const BookingSchema: Schema<IBooking> = new Schema({
  experience: {
    type: Schema.Types.ObjectId,
    ref: "Experience",
    required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: String, required: true },
  price: {
    type: Number,
    required: [true, "You must add the price for the booking"],
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now },
  paid: { type: Boolean, required: true },
});

BookingSchema.index({ experience: 1 });
BookingSchema.index({ user: 1 });

BookingSchema.pre(
  /^find/,
  function (this: mongoose.Query<IBooking[], IBooking>, next) {
    this.populate("user").populate({
      path: "experience",
      select: "name",
    });
    next();
  }
);

const Booking: Model<IBooking> = mongoose.model<IBooking>(
  "Booking",
  BookingSchema
);

export { Booking };
