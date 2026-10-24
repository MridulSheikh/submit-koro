import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import reviewController from "./review.controller";
import { updateReviewSchema } from "./review.validationSchema";


const router = Router();

router.route("/")
.post(auth({reviewPermission:["REVIEW"]}), reviewController.createReviewController)

router.route("/:id")
.delete(auth({reviewPermission:["REVIEW"]}), reviewController.deleteReviewById)
.patch(
  auth({reviewPermission:["REVIEW"]}),
  validateRequest(updateReviewSchema),
  reviewController.updateReviewById,
)

router.route("/submission/:submissionId")
.get(auth({reviewPermission: ['VIEW','REVIEW']}), reviewController.getReviewBySubmissionId)

router.route("/reviewer/:id")
.get(auth({reviewPermission: ['VIEW','REVIEW']}), reviewController.gerReviewByReviewerId)

export default router;