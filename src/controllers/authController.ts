import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/userModel.js";
import asyncErrorWrapper from "../utils/catch.js";
import sendEmail from "../utils/email.js";
import ApplicationError from "../utils/error.js";
import { emailRegex } from "../utils/helpers.js";

class AuthController {
  private static generateToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.jwt as string, {
      expiresIn: process.env.jwtexpire as string,
    });
  }

  private static sendToken(user: IUser, statusCode: number, res: Response) {
    const token = this.generateToken(user.id);
    res.status(statusCode).json({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      status: "success",
      data: {
        user,
      },
    });
  }

  public signup = asyncErrorWrapper(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        username,
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
      } = req.body;

      const newUser = await User.create({
        username,
        firstname,
        lastname,
        email,
        password,
        confirmPassword,
      });

      AuthController.sendToken(newUser, 201, res);
    }
  );

  public login = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return next(new ApplicationError("Please provide your details", 400));
      }

      let user;

      try {
        if (emailRegex.test(identifier)) {
          user = await User.findOne({ email: identifier }).select("+password");
        } else {
          user = await User.findOne({ username: identifier }).select(
            "+password"
          );
        }

        if (!user) {
          return next(new ApplicationError("User not found", 404));
        }

        const isValidPassword = await user.checkPassword(
          password,
          user.password
        );

        if (!user || !isValidPassword) {
          return next(
            new ApplicationError("Provided credentials are not correct", 404)
          );
        }

        AuthController.sendToken(user, 200, res);
      } catch (error) {
        console.error("Login error:", error);
        return next(new ApplicationError("An unexpected error occurred", 500));
      }
    }
  );

  public forgot = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
          return next(
            new ApplicationError(
              "No user has been found with this email address",
              404
            )
          );
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;
        const message = `Forgot your password? Please go to this link to reset it: ${resetURL}`;

        try {
          await sendEmail({
            email: user.email,
            subject: "Password Change Request - Valid for 10 Minutes",
            message,
          });

          res.status(200).json({
            status: "success",
            message: "Token has been sent to your email address",
          });
        } catch (error: any) {
          console.error(error.message);
          user.passwordResetToken = null;
          user.passwordResetExpires = null;
          await user.save({ validateBeforeSave: false });
          return next(
            new ApplicationError(
              "There was an error sending the email, try again later",
              500
            )
          );
        }
      } catch (error) {
        console.error("Password reset error:", error);
        return next(new ApplicationError("An unexpected error occurred", 500));
      }
    }
  );

  public reset = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const hashedToken = crypto
          .createHash("sha256")
          .update(req.params.token)
          .digest("hex");

        const user = await User.findOne({
          passwordResetToken: hashedToken,
          passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
          return next(new ApplicationError("Token is invalid or expired", 400));
        }

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;

        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        AuthController.sendToken(user, 200, res);
      } catch (error) {
        console.error("Password reset error:", error);
        return next(new ApplicationError("An unexpected error occurred", 500));
      }
    }
  );

  public update = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).user?.id;
        if (!userId) {
          return next(new ApplicationError("User not authenticated", 401));
        }

        const user = await User.findById(userId).select("password");
        if (!user) {
          return next(new ApplicationError("User not found", 404));
        }

        const isPasswordCorrect = await user.checkPassword(
          req.body.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return next(new ApplicationError("Incorrect password", 400));
        }

        user.password = req.body.newPassword;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
      } catch (error) {
        console.error("Password update error:", error);
        return next(new ApplicationError("An unexpected error occurred", 500));
      }
    }
  );

  public restrictRoles = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (!roles.includes((req as any).user.role)) {
        return next(
          new ApplicationError(
            "Unauthorized action. You don't have enough permission",
            403
          )
        );
      }
      next();
    };
  };
}

export default new AuthController();
