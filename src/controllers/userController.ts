import { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "../utils/catch.js";
import { User } from "../models/userModel.js";
import ApplicationError from "../utils/error.js";
import { filterObjectValues } from "../utils/helpers.js";

class UserController {
  getAllUsers = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await User.find();

      res.status(201).json({
        status: "success",
        data: {
          user: users,
        },
      });
    }
  );

  updateMyDetails = asyncErrorWrapper(
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

  deleteMyProfile = asyncErrorWrapper(
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

  getUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  createUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  updateUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  deleteUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}

export default new UserController();
