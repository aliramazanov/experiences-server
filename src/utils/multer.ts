import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import sharp from "sharp";
import asyncErrorWrapper from "./catch";
import ApplicationError from "./error";

export interface MulterRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] };
}

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

export const resizeProfilePhoto = asyncErrorWrapper(
  async (req: Request, _res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) return next();
    const userId = multerReq.user?.id || "unknown";
    multerReq.file.filename = `user-${userId}-${Date.now()}.jpeg`;

    try {
      await sharp(multerReq.file.buffer)
        .resize(700, 700)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(`public/img/users/${multerReq.file.filename}`);
      next();
    } catch (err) {
      next(err);
    }
  }
);

export const uploadUserPhoto = upload.single("photo");

export const resizeExperienceImages = asyncErrorWrapper(
  async (req: Request, _res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;
    if (!multerReq.files?.cover?.[0] || !multerReq.files?.images?.[0])
      return next();

    multerReq.body.cover = `experience-${multerReq.params.id}-${Date.now()}-cover.jpeg`;

    try {
      const coverFile = multerReq.files.cover[0];
      await sharp(coverFile.buffer)
        .resize(2000, 1400)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(`public/img/users/${multerReq.body.cover}`);

      req.body.images = [];

      await Promise.all(
        multerReq.files.images.map(async (file, index) => {
          const imageSaveName = `experience-${multerReq.params.id}-${Date.now()}-${index + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(2000, 1400)
            .toFormat("jpeg")
            .jpeg({ quality: 95 })
            .toFile(`public/img/users/${imageSaveName}`);

          req.body.images.push(imageSaveName);
        })
      );
      next();
    } catch (err) {
      next(err);
    }
  }
);
