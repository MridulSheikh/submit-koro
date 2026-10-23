import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { changeUserRole, getCurrentUser } from "./user.controller";
import { changeUserRoleSchema } from "./user.validation";

const router = Router();

router.get("/me", auth(), getCurrentUser);

router.patch(
  "/:userId/role",
  auth({
    teamPermission:'MANAGE'
  }),
  validateRequest(changeUserRoleSchema),
  changeUserRole
);

export default router;
