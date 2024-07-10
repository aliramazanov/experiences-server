import mongoose, { CallbackError, Document, Model, Schema } from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

interface IUser extends Document {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  photo?: string;
  role: string;
  password: string;
  passConfirm: string | null;
  checkPassword(candidate: string, initial: string): Promise<boolean>;
  passwordChangedAt?: Date;
  changedPassAfter(JWTstamp: any): boolean;
  createPasswordResetToken(): string;
  passwordResetToken: string;
  passwordResetExpires: Date;
}

const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: [true, "Please pick an username"],
    trim: true,
  },
  firstname: {
    type: String,
    required: [true, "Please provide your firstname"],
    trim: true,
  },
  lastname: {
    type: String,
    required: [true, "Please provide your lastname"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["client", "guide", "lead", "admin"],
    default: "client",
  },
  password: {
    type: String,
    required: [true, "Please secure your account with a password"],
    maxlength: [
      16,
      "Please provide a password between a length of 8 to 16 characters",
    ],
    minlength: [
      8,
      "Please provide a password between a length of 8 to 16 characters",
    ],
    select: false,
  },
  passConfirm: {
    type: String,
    validate: {
      validator: function (this: IUser, element: any) {
        return element === this.password;
      },
      message: "Passwords do not match",
    },
    required: [true, "Please confirm your password"],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Hash the password with a hook and bcryptjs

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(this.password, salt);
    this.password = hashedPassword;
    this.passConfirm = null;
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// User schema methods

userSchema.methods.checkPassword = async function (
  candidate: string,
  initial: string
) {
  return await bcryptjs.compare(candidate, initial);
};

userSchema.methods.changedPassAfter = function (JWTstamp: any): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      String(this.passwordChangedAt.getTime() / 1000),
      10
    );
    return changedTimestamp > JWTstamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
