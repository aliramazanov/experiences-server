import { NextFunction, Request, Response } from "express";
import { Model, Document } from "mongoose";
import asyncErrorWrapper from "../utils/catch.js";
import ApplicationError from "../utils/error.js";

class FactoryHandler {
  public createOne = <T extends Document>(Model: Model<T>) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        if (!req.body) {
          return next(new ApplicationError("Invalid request data", 400));
        }

        const document = await Model.create(req.body);

        if (!document) {
          return next(new ApplicationError("Failed to create document", 400));
        }

        res.status(201).json({
          status: "success",
          data: {
            data: document,
          },
        });
      }
    );

  public updateOne = <T extends Document>(Model: Model<T>) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        const document = await Model.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

        if (!document) {
          return next(
            new ApplicationError(
              "No documents has been found in the system",
              400
            )
          );
        }

        res.status(200).json({
          status: "success",
          data: {
            data: document,
          },
        });
      }
    );

  public deleteOne = <T extends Document>(Model: Model<T>) =>
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

export default new FactoryHandler();
