import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IReview extends Document {
  review: string;
  rating?: number;
  createdAt: Date;
  experience: Types.ObjectId;
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
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: [true, "Review must belong to an experience you have booked"],
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

reviewSchema.pre(/^find/, function (next) {
  const query = this as mongoose.Query<any, any>;

  query.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
