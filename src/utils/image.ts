import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";
import ApplicationError from "./error";

const multerStorage = multer.memoryStorage();

const multerFilter: (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => void = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    const error = new ApplicationError(
      "Invalid image or incorrect format. Please try again.",
      400
    );
    cb(error as any, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2048 * 2048 * 5 },
});

export const resizeProfilePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return next();
  const userId = (req as any).user?.id || "unknown";
  req.file.filename = `user-${userId}-${Date.now()}.jpeg`;

  try {
    await sharp(req.file.buffer)
      .resize(700, 700)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`public/img/users/${req.file.filename}`);
    next();
  } catch (err) {
    next(err);
  }
};

export const uploadUserPhoto = upload.single("photo");

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
