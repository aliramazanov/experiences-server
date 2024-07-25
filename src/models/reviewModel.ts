import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IReview extends Document {
  review: string;
  rating?: number;
  createdAt: Date;
  tour: Types.ObjectId;
  user: Types.ObjectId;
}

const reviewSchema: Schema<IReview> = new Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour you have booked"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
