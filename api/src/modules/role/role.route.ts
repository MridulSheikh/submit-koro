import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import roleController from "./role.controller";
import { createRoleSchema, updateRoleSchema } from "./role.validation";

const router = Router();

router
  .route("/")
  .get(
    auth({ teamPermission: ["VIEW", "MANAGE"] }),
    roleController.getRoles,
  )
  .post(
    auth({ teamPermission: "MANAGE" }),
    validateRequest(createRoleSchema),
    roleController.createRole,
  );

router
  .route("/:id")
  .get(auth({ teamPermission: ["VIEW", "MANAGE"] }), roleController.getRoleById)
  .patch(
    auth({ teamPermission: "MANAGE" }),
    validateRequest(updateRoleSchema),
    roleController.updateRole,
  )
  .delete(auth({ teamPermission: "MANAGE" }), roleController.deleteRole);

export default router;
