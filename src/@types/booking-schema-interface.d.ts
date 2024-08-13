import { Document, Types } from "mongoose";

export interface IBooking extends Document {
  booking: string;
  price: number;
  rating?: number;
  createdAt: Date;
  experience: Types.ObjectId;
  user: Types.ObjectId;
  paid: boolean;
}
