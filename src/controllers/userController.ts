import { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "../utils/catch.js";
import { IUser, User } from "../models/userModel.js";
import ApplicationError from "../utils/error.js";
import { filterObjectValues } from "../utils/helpers.js";
import FactoryHandler from "../controllers/factoryHandler.js";

class UserController {
  public getAllUsers = asyncErrorWrapper(
    async (req: Request, res: Response, _next: NextFunction) => {
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
      const updatedUser = await User.findByIdAndUpdate((req as any).user.id, {
        active: false,
      });

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );

  public getUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  public createUser = FactoryHandler.createOne<IUser>(User);

  public updateUser = FactoryHandler.updateOne<IUser>(User);

  public deleteUser = FactoryHandler.deleteOne<IUser>(User);
}

export default new UserController();
