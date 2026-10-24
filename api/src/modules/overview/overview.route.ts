import { Router } from "express";
import auth from "../../middleware/auth";
import overviewController from "./overview.controller";

const router = Router();

router.get(
  "/",
  auth({ overviewPermission: "VIEW" }),
  overviewController.getOverview,
);

export default router;
