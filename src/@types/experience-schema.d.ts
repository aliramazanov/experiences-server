import { Document, Types } from "mongoose";

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
