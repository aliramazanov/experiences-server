import { NextFunction, Request, Response } from "express";
import ApplicationError from "./error";

const restrictRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return next(
        new ApplicationError(
          "Unauthorized action. You don't have enough permission",
          403
        )
      );
    }
    next();
  };
};

export default restrictRoles;
