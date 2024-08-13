import { Request } from "express";
import multer, { FileFilterCallback, Multer } from "multer";

export interface MulterRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
}
