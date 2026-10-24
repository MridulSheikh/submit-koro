import httpStatus from "http-status";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {
  getAllUsers as loadAllUsers,
  changeUserRole as updateUserRole,
  changeUserStatus as updateUserStatus,
  updateProfile as updateUserProfile,
} from "./user.service";
import { getAllUsersQuerySchema } from "./user.validation";
import { prisma } from "../../../lib/prisma";

export const getAllUsers = catchAsync(async (req, res) => {
  const query = getAllUsersQuerySchema.parse(req.query);
  const { users, total, page, limit } = await loadAllUsers(query);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: { page, limit, total },
    data: users,
  });
});

// get current user
export const getCurrentUser = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { role: {
       select: {
        name: true,
        key: true,
        overviewPermission: true,
        reviewPermission: true,
        submissionPermission: true,
        teamPermission: true,
      },
    } },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Current user retrieved",
    data: user,
  });
});


// change user role
export const changeUserRole = catchAsync(async (req, res) => {
  const data = await updateUserRole(req.params.userId as string, req.body, req.user?.id as string);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role updated",
    data,
  });
});

export const changeUserStatus = catchAsync(async (req, res) => {
  const data = await updateUserStatus(req.params.userId as string, req.body.status, req.user!.id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated",
    data,
  });
});

export const updateProfile = catchAsync(async (req, res) => {
  const data = await updateUserProfile(req.user!.id, req.body);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data,
  });
});

export const changePassword = catchAsync(async (req, res) => {
  await auth.api.changePassword({
    body: {
      ...req.body,
      revokeOtherSessions: true,
    },
    headers: fromNodeHeaders(req.headers),
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password updated successfully",
    data: null,
  });
});

export const logout = catchAsync(async (req, res) => {
  const { headers, response } = await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
    returnHeaders: true,
  });

  if (!response.success) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Logout failed");
  }

  const cookies = headers.getSetCookie();
  if (cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});
