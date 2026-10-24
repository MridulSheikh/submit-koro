import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from "cloudinary";
import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";

const uploadImage = async (buffer: Buffer, userId: string) => {
  const detectedType = await fileTypeFromBuffer(buffer);
  const allowedExtensions = new Set(["jpg", "png", "webp"]);
  if (
    !detectedType ||
    !["image/jpeg", "image/png", "image/webp"].includes(detectedType.mime) ||
    !allowedExtensions.has(detectedType.ext)
  ) {
    throw new AppError(
      httpStatus.UNSUPPORTED_MEDIA_TYPE,
      "Upload a valid JPEG, PNG, or WebP image",
    );
  }

  const cloudName = config.CLOUDINARY_CLOUD_NAME;
  const apiKey = config.CLOUDINARY_API_KEY;
  const apiSecret = config.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Profile image uploads are not configured",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    ...(config.CLOUDINARY_UPLOAD_PREFIX
      ? { upload_prefix: config.CLOUDINARY_UPLOAD_PREFIX }
      : {}),
  });

  const uploadedImage = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `submit-koro/profile-images/${userId}`,
            public_id: randomUUID(),
            overwrite: false,
            resource_type: "image",
            allowed_formats: ["jpg", "png", "webp"],
          },
          (error, result) => {
            if (error) {
              const providerError = error as UploadApiErrorResponse;
              console.error("Cloudinary profile image upload failed:", {
                name: providerError.name,
                code: providerError.http_code,
                message: providerError.message,
                requestId: providerError.request_id,
              });
              let message = `Cloudinary upload failed: ${providerError.message}`;
              if (providerError.http_code === httpStatus.UNAUTHORIZED) {
                message =
                  "Cloudinary rejected the API credentials. Verify the configured Cloudinary API key and secret.";
              } else if (providerError.http_code === httpStatus.FORBIDDEN) {
                const reason = providerError.message?.trim();
                message = reason
                  ? `Cloudinary rejected the upload (403): ${reason}`
                  : "Cloudinary rejected the upload (403). Check the account's upload permissions and configuration.";
              }

              reject(new AppError(httpStatus.BAD_GATEWAY, message));
              return;
            }
            if (!result) {
              reject(
                new AppError(
                  httpStatus.BAD_GATEWAY,
                  "Cloudinary returned no profile image",
                ),
              );
              return;
            }
            resolve(result);
          },
        )
        .end(buffer);
    },
  );

  return uploadedImage.secure_url;
};

export default uploadImage;
