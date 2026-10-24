import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import roleService from "./role.service";

const getRoles = catchAsync(async (_req, res) => {
  const result = await roleService.getRoles();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Roles retrieved successfully",
    data: result,
  });
});

const getRoleById = catchAsync(async (req, res) => {
  const result = await roleService.getRoleById(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Role retrieved successfully",
    data: result,
  });
});

const createRole = catchAsync(async (req, res) => {
  const result = await roleService.createRole(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Role created successfully",
    data: result,
  });
});

const updateRole = catchAsync(async (req, res) => {
  const result = await roleService.updateRole(req.params.id as string, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Role updated successfully",
    data: result,
  });
});

const deleteRole = catchAsync(async (req, res) => {
  const result = await roleService.deleteRole(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Role deleted successfully",
    data: result,
  });
});

const roleController = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};

export default roleController;
