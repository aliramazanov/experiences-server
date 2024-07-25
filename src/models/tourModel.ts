import mongoose, { Document, Model, Query, Schema, Types } from "mongoose";
import { IUser } from "./userModel";
// import slugify from "slugify";

interface ILocation {
  type: string;
  coordinates: number[];
  address: string;
  description: string;
  day?: number;
}

interface IStartLocation extends Omit<ILocation, "day"> {}

interface ITour extends Document {
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: "easy" | "medium" | "difficult";
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  secretTour: boolean;
  durationWeeks: number;
  startLocation: IStartLocation;
  locations: ILocation[];
  guides: (Types.ObjectId | IUser)[];
}

const tourSchema: Schema<ITour> = new Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, val: number) {
          return typeof val === "undefined" || val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for duration in weeks

tourSchema.virtual("durationWeeks").get(function (this: ITour) {
  return this.duration / 7;
});

// Document middleware: runs before .save() and .create()

// tourSchema.pre<ITour>("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// Query middleware to filter out secret tours

tourSchema.pre("find", function (next) {
  this.where({ secretTour: { $ne: true } });
  next();
});

// Query middleware to populate guides

tourSchema.pre<Query<ITour, ITour>>(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// Aggregation middleware to add match stage for secret tours

tourSchema.pre("aggregate", function (next) {
  const pipeline = this.pipeline();
  if (!pipeline.some((stage) => stage.hasOwnProperty("$match"))) {
    pipeline.unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});

tourSchema.index({ startLocation: "2dsphere" });
tourSchema.index({ locations: "2dsphere" });

const Tour: Model<ITour> = mongoose.model<ITour>("Tour", tourSchema);

export { Tour, ITour };
