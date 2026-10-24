import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import {
  changeUserRole,
  changeUserStatus,
  changePassword,
  getAllUsers,
  getCurrentUser,
  logout,
  updateProfile,
} from "./user.controller";
import uploadImageController from "../upload/upload.controller";
import uploadImageMiddleware from "../upload/upload.middleware";
import {
  changeUserRoleSchema,
  changePasswordSchema,
  changeUserStatusSchema,
  updateProfileSchema,
} from "./user.validation";

const router = Router();

router.get("/", auth({ teamPermission: ["VIEW", "MANAGE"] }), getAllUsers);
router.post("/logout", auth(), logout);
router.get("/me", auth(), getCurrentUser);
router.post(
  "/me/image",
  auth(),
  uploadImageMiddleware,
  uploadImageController,
);
router.patch(
  "/me/password",
  auth(),
  validateRequest(changePasswordSchema),
  changePassword,
);
router.patch(
  "/me",
  auth(),
  validateRequest(updateProfileSchema),
  updateProfile,
);

router.patch(
  "/:userId/role",
  auth({
    teamPermission:'MANAGE'
  }),
  validateRequest(changeUserRoleSchema),
  changeUserRole
);

router.patch(
  "/:userId/status",
  auth({ teamPermission: "MANAGE" }),
  validateRequest(changeUserStatusSchema),
  changeUserStatus,
);

export default router;
