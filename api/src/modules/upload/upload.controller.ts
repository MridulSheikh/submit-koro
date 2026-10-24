import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import uploadImage from "./upload.service";

const uploadImageController = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Choose an image to upload");
  }

  const image = await uploadImage(req.file.buffer, req.user!.id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile image uploaded successfully",
    data: { image },
  });
});

export default uploadImageController;
