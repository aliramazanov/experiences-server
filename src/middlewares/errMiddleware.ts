import { NextFunction, Request, Response } from "express";
import ApplicationError from "../utils/error.js";

const sendDevelopmentErrors = (error: Error | any, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error: error,
  });
};

const sendProductionErrors = (error: Error | any, res: Response) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const handleJwtErrors = (_error: any) =>
  new ApplicationError("Invalid authorization, please login again", 401);

const errorController = (
  error: Error | any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevelopmentErrors(error, res);
  } else if (process.env.NODE_ENV === "production") {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    )
      error = handleJwtErrors(error);
    sendProductionErrors(error, res);
  }
};

export default errorController;
