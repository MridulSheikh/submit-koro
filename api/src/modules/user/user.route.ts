import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import {
  changeUserRole,
  changePassword,
  getCurrentUser,
  updateProfile,
} from "./user.controller";
import {
  changeUserRoleSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "./user.validation";

const router = Router();

router.get("/me", auth(), getCurrentUser);
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

export default router;
