import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  photo?: string;
  role: string;
  password: string;
  confirmPassword: string | null;
  checkPassword(candidate: string, initial: string): Promise<boolean>;
  passwordChangedAt?: Date;
  changedPasswordAfter(JWTstamp: any): boolean;
  createPasswordResetToken(): string;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  active: boolean;
}
