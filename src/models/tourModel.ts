import mongoose, { Document, Model, Schema } from "mongoose";
// import slugify from "slugify";

interface ITour extends Document {
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
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

// Aggregation middleware to add match stage for secret tours

tourSchema.pre("aggregate", function (next) {
  const pipeline = this.pipeline();
  if (!pipeline.some((stage) => stage.hasOwnProperty("$match"))) {
    pipeline.unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});

const Tour: Model<ITour> = mongoose.model<ITour>("Tour", tourSchema);

export default Tour;
