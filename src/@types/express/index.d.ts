import { File } from "multer";

declare global {
  namespace Express {
    interface Multer {
      file: File;
    }
  }
}
