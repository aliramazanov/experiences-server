import mongoose, { Document, Model, Query, Schema, Types } from "mongoose";
import { Experience } from "./experience.model.js";

interface IReview extends Document {
  review: string;
  rating?: number;
  createdAt: Date;
  experience: Types.ObjectId;
  user: Types.ObjectId;
}

interface IReviewModel extends Model<IReview> {
  calculateAverageRating(experienceId: Types.ObjectId): Promise<void>;
}

interface IReviewQuery extends Query<any, any> {
  r?: IReview;
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

reviewSchema.index({ experience: 1, user: 1 }, { unique: true });

// Populating user names and photos on reviews
reviewSchema.pre<Query<IReview, IReview>>(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calculateAverageRating = async function (
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

reviewSchema.pre<IReview>("save", async function (next) {
  await (this.constructor as IReviewModel).calculateAverageRating(
    this.experience
  );

  next();
});

reviewSchema.pre<IReviewQuery>("findOneAndUpdate", async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post<IReviewQuery>("findOneAndUpdate", async function () {
  if (this.r) {
    await (this.r.constructor as IReviewModel).calculateAverageRating(
      this.r.experience
    );
  }
});

const Review: IReviewModel = mongoose.model<IReview, IReviewModel>(
  "Review",
  reviewSchema
);

export { IReview, Review };
