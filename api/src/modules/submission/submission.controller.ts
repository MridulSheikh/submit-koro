import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import submissionServices from "./submission.service";
import type { TRole } from "../user/user.type";
import {
    getAllSubmissionsQuerySchema,
    updateSubmissionSchema,
    updateSubmissionStatusSchema,
} from "./submission.validation";

const canViewAllSubmissions = (role: TRole | null | undefined) =>
    Boolean(
        role?.submissionPermission.includes("VIEW") ||
        role?.reviewPermission.some((permission) => permission === "VIEW" || permission === "REVIEW"),
    );


const createSubmissionIntoDB = catchAsync(async(req, res)=>{
    const body = req.body;
    const user = req.user;

    const response = await submissionServices.createSubmissionService(body, user?.id as string)

    sendResponse(res,{
        statusCode: 200,
        message: "successfully submission submitted",
        success: true,
        data: response,
    })
})

const getAllSubmissionFromDB = catchAsync(async(req, res)=>{
    const query = getAllSubmissionsQuerySchema.parse(req.query);
    const { submissions, total } = await submissionServices.getAllSubmissionService(query);

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Successfully retrived submissions",
        meta: {
          page: query.page,
          limit: query.limit,
          total,
        },
        data: submissions
    })
})

const getSingleSubmission = catchAsync(async(req, res)=>{
    const id = req.params.id;
    const user = req.user!;
    const response = await submissionServices.getSingleSubmissionService(id as string, {
        userId: user.id,
        canViewAll: canViewAllSubmissions(user.role),
    });

    sendResponse(res,{
        statusCode: 200,
        message: "Successfully retrived submission data",
        success: true,
        data: response
    })
})

const updateSubmission = catchAsync(async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    if (body.status && !req.user?.role?.reviewPermission.includes("REVIEW")) {
        throw new AppError(403, "You don't have permission to change submission status");
    }
    const response = await submissionServices.updateSubmissionService(
        id as string,
        body,
        req.user!.id,
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Successfully updated submission",
        success: true,
        data: response,
    });
});

const updateSubmissionStatus = catchAsync(async (req, res) => {
    const { params: { id }, body: { status } } = updateSubmissionStatusSchema.parse({ params: req.params, body: req.body });
    const response = await submissionServices.updateSubmissionService(id, { status });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully updated submission status",
        data: response,
    });
});

const deleteSubmission = catchAsync(async (req, res) => {
    const result = await submissionServices.deleteSubmissionService(
        req.params.id as string,
        req.user!.id,
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Successfully deleted submission",
        success: true,
        data: result,
    });
});

const getSubmissionById = catchAsync(async(req, res)=>{
    const id = req.params.userId;
    const query = getAllSubmissionsQuerySchema.parse(req.query);
    const user = req.user!;
    const { submissions, total } = await submissionServices.getSubmissionByUserId(
        id as string,
        query,
        { userId: user.id, canViewAll: canViewAllSubmissions(user.role) },
    );

    sendResponse(res,{
        statusCode: 200,
        message: "Successfully retrived submission",
        success: true,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
        },
        data: submissions
    })
})

const submissionController = {
    createSubmissionIntoDB,
    getAllSubmissionFromDB,
    getSingleSubmission,
    updateSubmission,
    updateSubmissionStatus,
    deleteSubmission,
    getSubmissionById
}



export default submissionController;
