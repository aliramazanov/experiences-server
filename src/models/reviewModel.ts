import mongoose, { Document, Model, Schema } from "mongoose";

interface IReview extends Document {
  review: string;
  rating?: number;
  createdAt: Date;
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
