import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncErrorWrapper from "../utils/catch.js";
import ApplicationError from "../utils/error.js";
import { emailRegex } from "../utils/helpers.js";

class Authentication {
  private static generateToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.jwt as string, {
      expiresIn: process.env.jwtexpire as string,
    });
  }

  static signup = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { username, firstname, lastname, email, password, passConfirm } =
        req.body;

      const newUser = await User.create({
        username,
        firstname,
        lastname,
        email,
        password,
        passConfirm,
      });

      const token = Authentication.generateToken(newUser._id as string);

      res.status(201).json({
        headers: {
          Authorization: `Bearer ${token}`,
        },
        status: "success",
        data: {
          user: newUser,
        },
      });
    }
  );

  static login = asyncErrorWrapper(
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

        const isValidPassword = user.checkPassword(password, user.password);

        if (!user || !isValidPassword) {
          return next(
            new ApplicationError("Provided identifiers are not correct", 404)
          );
        }

        const token = Authentication.generateToken(user._id as string);

        res.status(200).json({
          headers: {
            Authorization: `Bearer ${token}`,
          },
          status: "success",
          data: {
            user,
          },
        });
      } catch (error) {
        console.error("Login error:", error);
        return next(new ApplicationError("An unexpected error occurred", 500));
      }
    }
  );
}

export default Authentication;
