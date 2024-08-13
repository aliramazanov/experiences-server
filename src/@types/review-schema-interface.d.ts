import { Document, Model, Query, Types } from "mongoose";

export interface IReview extends Document {
  review: string;
  rating?: number;
  createdAt: Date;
  experience: Types.ObjectId;
  user: Types.ObjectId;
}

export interface IReviewModel extends Model<IReview> {
  calculateAverageRating(experienceId: Types.ObjectId): Promise<void>;
}

export interface IReviewQuery extends Query<any, IReview> {
  r?: IReview;
}
