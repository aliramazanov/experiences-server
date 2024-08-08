import { NextFunction, Request, Response } from "express";
import BaseController from "./base.controller.js";
import { IUser, User } from "../models/user.model.js";
import asyncErrorWrapper from "../utils/async-error-wrapper.js";
import ApplicationError from "../utils/application-errors-handler.js";
import { filterObjectValues } from "../utils/general-helpers.js";

class UserController {
  public getAllUsers = asyncErrorWrapper(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const users = await User.find();

      res.status(201).json({
        status: "success",
        data: {
          user: users,
        },
      });
    }
  );

  public updateMyDetails = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.body.password || req.body.confirmPassword) {
        return next(
          new ApplicationError("This is a wrong route or wrong parameters", 400)
        );
      }

      const updatedFields = filterObjectValues(req.body, "name", "email");

      if (req.file) {
        updatedFields.photo = req.file.filename;
      }

      const updatedUser = await User.findById(
        (req as any).user.id,
        updatedFields,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        status: "success",
        data: updatedUser,
      });
    }
  );

  public deleteMyProfile = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      await User.findByIdAndUpdate((req as any).user.id, {
        active: false,
      });

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );

  public getUser = BaseController.getOne<IUser>(User);

  public createUser = BaseController.createOne<IUser>(User);

  public updateUser = BaseController.updateOne<IUser>(User);

  public deleteUser = BaseController.deleteOne<IUser>(User);

  public getMe = (req: Request, _res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.id) {
      req.query.id = (req as any).user.id;
    } else {
      return next(new Error("User not authenticated"));
    }
    next();
  };
}

export default new UserController();
