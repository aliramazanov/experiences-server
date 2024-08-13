import { NextFunction, Request, Response } from "express";
import { Document, Model } from "mongoose";
import BaseService from "../services/base.service.js";
import ApplicationError from "../utils/application-errors-handler.js";
import asyncErrorWrapper from "../utils/async-error-wrapper.js";

class BaseController {
  public createOne = <T extends Document>(Model: Model<T>) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          if (!req.body) {
            return next(new ApplicationError("Invalid request data", 400));
          }
          const document = await BaseService.createOne(Model, req.body);
          res.status(201).json({
            status: "success",
            data: {
              data: document,
            },
          });
        } catch (error) {
          next(error);
        }
      }
    );

  public updateOne = <T extends Document>(Model: Model<T>) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const document = await BaseService.updateOne(
            Model,
            req.params.id,
            req.body
          );
          res.status(200).json({
            status: "success",
            data: {
              data: document,
            },
          });
        } catch (error) {
          next(error);
        }
      }
    );

  public deleteOne = <T extends Document>(Model: Model<T>) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          await BaseService.deleteOne(Model, req.params.id);
          res.status(204).json({
            status: "success",
            data: null,
          });
        } catch (error) {
          next(error);
        }
      }
    );

  public getOne = <T extends Document>(
    Model: Model<T>,
    populateOptions?: any
  ) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const document = await BaseService.getOne(
            Model,
            req.params.id,
            populateOptions
          );
          res.status(200).json({
            status: "success",
            data: {
              data: document,
            },
          });
        } catch (error) {
          next(error);
        }
      }
    );

  public getAll = <T extends Document>(Model: Model<T>) =>
    asyncErrorWrapper(
      async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const documents = await BaseService.getAll(Model, req.query);
          res.status(200).json({
            status: "success",
            results: documents.length,
            data: {
              documents,
            },
          });
        } catch (error) {
          next(error);
        }
      }
    );
}

export default new BaseController();
