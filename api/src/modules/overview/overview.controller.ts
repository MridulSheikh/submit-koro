import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import overviewService from "./overview.service";

const getOverview = catchAsync(async (_req, res) => {
  const result = await overviewService.getOverview();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Overview retrieved successfully",
    data: result,
  });
});

const overviewController = { getOverview };

export default overviewController;
