import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import ApplicationError from "./error";

const multerStorage: StorageEngine = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "public/images/users");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = file.mimetype.split("/")[1];
    const userId = (req as any).user?.id || "unknown";
    cb(null, `user-${userId}-${Date.now()}.${ext}`);
  },
});

const multerFilter: (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => void = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    const error = new ApplicationError(
      "Not a correct image or format is incorrect, please try again",
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

export const uploadUserPhoto = upload.single("photo");

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
