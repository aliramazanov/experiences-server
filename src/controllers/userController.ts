import { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "../utils/catch";
import User from "../models/userModel";

class UserController {
  static getAllUsers = asyncErrorWrapper(
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
  static getUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  static createUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  static updateUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  static deleteUser = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  static x = asyncErrorWrapper(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}
