import mongoose, { Schema, Types } from "mongoose";
import { IReview, IReviewModel } from "../@types/review-schema-interface.js";
import { Experience } from "./experience.model.js";

const ReviewSchema: Schema<IReview> = new Schema(
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

ReviewSchema.index({ experience: 1, user: 1 }, { unique: true });

// Populating user names and photos on reviews
ReviewSchema.pre(
  /^find/,
  function (this: mongoose.Query<IReview[], IReview>, next) {
    this.populate({
      path: "user",
      select: "name photo",
    });
    next();
  }
);

ReviewSchema.statics.calculateAverageRating = async function (
  experienceId: Types.ObjectId
) {
  const statistics = await this.aggregate([
    {
      $match: { experience: experienceId },
    },
    {
      $group: {
        _id: "$experience",
        numberOfRatings: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (statistics.length > 0) {
    await Experience.findByIdAndUpdate(experienceId, {
      ratingsQuantity: statistics[0].numberOfRatings,
      ratingsAverage: statistics[0].averageRating,
    });
  } else {
    await Experience.findByIdAndUpdate(experienceId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Use `IReviewModel` for the constructor context
ReviewSchema.pre<IReview>("save", async function (this: IReview, next) {
  await (this.constructor as IReviewModel).calculateAverageRating(
    this.experience
  );
  next();
});

// Correct pre hook type for `findOneAndUpdate`
ReviewSchema.pre(
  "findOneAndUpdate",
  async function (this: mongoose.Query<IReview | null, IReview>, next) {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (docToUpdate) {
      await (docToUpdate.constructor as IReviewModel).calculateAverageRating(
        docToUpdate.experience
      );
    }
    next();
  }
);

const Review: IReviewModel = mongoose.model<IReview, IReviewModel>(
  "Review",
  ReviewSchema
);

export { Review };
