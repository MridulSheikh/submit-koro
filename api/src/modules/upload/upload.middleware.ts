import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          httpStatus.UNSUPPORTED_MEDIA_TYPE,
          "Upload a JPEG, PNG, or WebP image",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

const uploadImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(
          new AppError(
            httpStatus.REQUEST_ENTITY_TOO_LARGE,
            "Profile images must be 5 MB or smaller",
          ),
        );
        return;
      }

      next(new AppError(httpStatus.BAD_REQUEST, "Upload a single profile image"));
      return;
    }

    next(error);
  });
};

export default uploadImageMiddleware;
