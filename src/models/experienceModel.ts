import mongoose, { Document, Model, Query, Schema, Types } from "mongoose";
import { IUser } from "../models/userModel.js";
// import slugify from "slugify";

interface ILocation {
  type: string;
  coordinates: number[];
  address: string;
  description: string;
  day?: number;
}

interface IStartLocation extends Omit<ILocation, "day"> {}

interface IExperience extends Document {
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
  cover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  secretExperience: boolean;
  durationWeeks: number;
  startLocation: IStartLocation;
  locations: ILocation[];
  guides: (Types.ObjectId | IUser)[];
}

const experienceSchema: Schema<IExperience> = new Schema(
  {
    name: {
      type: String,
      required: [true, "An experience must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "An experience name must have less or equal then 40 characters",
      ],
      minlength: [
        10,
        "An experience name must have more or equal then 10 characters",
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "An experience must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "An experience must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "An experience must have a difficulty"],
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
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "An experience must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: IExperience, val: number) {
          return typeof val === "undefined" || val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "An experience must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    cover: {
      type: String,
      required: [true, "An experience must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    secretExperience: {
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

experienceSchema.index({ price: 1, ratingsAverage: -1 });

// Virtual property for duration in weeks

experienceSchema.virtual("durationWeeks").get(function (this: IExperience) {
  return this.duration / 7;
});

// Virtual property for populating

experienceSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "experience",
  localField: "_id",
});

// Document middleware: runs before .save() and .create()

// experienceSchema.pre<IExperience>("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// Query middleware to filter out secret experiences

// experienceSchema.pre("find", function (next) {
//   this.where({ secreExperience: { $ne: true } });
//   next();
// });

// Query middleware to populate guides

experienceSchema.pre<Query<IExperience, IExperience>>(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// Aggregation middleware to add match stage for secret experiences

experienceSchema.pre("aggregate", function (next) {
  const pipeline = this.pipeline();
  if (!pipeline.some((stage) => stage.hasOwnProperty("$match"))) {
    pipeline.unshift({ $match: { secretexperience: { $ne: true } } });
  }
  next();
});

experienceSchema.index({ startLocation: "2dsphere" });
experienceSchema.index({ locations: "2dsphere" });

const Experience: Model<IExperience> = mongoose.model<IExperience>(
  "experience",
  experienceSchema
);

export { Experience, IExperience };
