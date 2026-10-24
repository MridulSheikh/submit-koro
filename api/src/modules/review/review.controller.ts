import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import reviewService from "./review.service";


const createReviewController = catchAsync(async (req, res)=>{
    const result = await reviewService.createReviewService(req.body, req.user?.id as string);
    
    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Reiview successfully created",
        data: result
    })
})


const getReviewBySubmissionId = catchAsync(async(req, res)=>{
    const result = await reviewService.getReviewBySubmissionIdService(req.params.submissionId as string)

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Successfully retrived review",
        data: result
    })
})

const gerReviewByReviewerId = catchAsync(async(req, res)=>{
    const result = await reviewService.getReviewByReviewerId(req.params.id as string);
     sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Successfully retrived review",
        data: result
    })
})

const deleteReviewById = catchAsync(async(req, res)=>{
    const result = await reviewService.deletReviewById(req.params.id as string, req.user!.id)

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Succesfully deleted review by id",
        data: result
    })
})

const updateReviewById = catchAsync(async(req, res)=>{
    
    const result = await reviewService.updateReviewById(req.params.id as string, req.body)

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Successfully updated review",
        data: result
    })
})

const reviewController = {
    createReviewController,
    getReviewBySubmissionId,
    gerReviewByReviewerId,
    deleteReviewById,
    updateReviewById
}

export default reviewController;
