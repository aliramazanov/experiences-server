import { NextFunction, Request, Response } from "express";
import { Model, Document } from "mongoose";
import asyncErrorWrapper from "../utils/catch.js";
import ApplicationError from "../utils/error.js";

class FactoryFunctions {
  deleteOne = <T extends Document>(Model: Model<T>) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        const item = await Model.findByIdAndDelete(req.params.id);

        if (!item) {
          return next(
            new ApplicationError(
              "No related document has been found in the system",
              404
            )
          );
        }

        res.status(204).json({
          status: "success",
          data: null,
        });
      }
    );
}

export default new FactoryFunctions();
