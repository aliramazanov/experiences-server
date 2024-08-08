import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import asyncErrorWrapper from "../utils/async-error-wrapper.js";
import ApplicationError from "../utils/application-errors-handler.js";

const protect = asyncErrorWrapper(
  async (req: Request, _res: Response, next: NextFunction): Promise<any> => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      return next(
        new ApplicationError(
          "You are not logged in. Please login to access",
          401
        )
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.jwt as string
      ) as JwtPayload;

      if (!decoded || !decoded.id) {
        return next(
          new ApplicationError("Invalid token. Please login again", 401)
        );
      }

      const latestUser = await User.findById(decoded.id);

      if (!latestUser) {
        return next(
          new ApplicationError(
            "User not found. Your session might have expired. Please login again",
            401
          )
        );
      }

      if (latestUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new ApplicationError(
            "Your password has recently been changed. Please login again",
            401
          )
        );
      }

      (req as any).user = latestUser;

      next();
    } catch (err) {
      return next(new ApplicationError("Invalid token", 401));
    }
  }
);

export default protect;
