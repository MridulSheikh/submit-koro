import { Router } from "express";
import auth from "../../middleware/auth";
import limit from "../../middleware/limit";
import submissionController from "./submission.controller";
import validateRequest from "../../middleware/validateRequest";
import {
  createSubmissionSchema,
  updateSubmissionSchema,
} from "./submission.validation";

const router = Router();

router.use(limit("submission"));

router
  .route("/")
  .get(
    auth({ reviewPermission: ["REVIEW", "VIEW"] }),
    submissionController.getAllSubmissionFromDB,
  )
  .post(
    auth({ submissionPermission: ["SUBMIT"] }),
    validateRequest(createSubmissionSchema),
    submissionController.createSubmissionIntoDB,
  );

router
  .route("/:id")
  .get(
    auth({ submissionPermission: ["VIEW", "SUBMIT"] }),
    submissionController.getSingleSubmission,
  )
  .patch(
    validateRequest(updateSubmissionSchema),
    auth({ submissionPermission: ["SUBMIT"] }),
    submissionController.updateSubmission,
  )
  .delete(
    auth({ submissionPermission: ["SUBMIT"] }),
    submissionController.deleteSubmission,
  );

router.patch(
  "/review/:id/status",
  auth({ reviewPermission: "REVIEW" }),
  submissionController.updateSubmissionStatus,
);

router
  .route("/user/:userId")
  .get(
    auth({ submissionPermission: ["VIEW", "SUBMIT"] }),
    submissionController.getSubmissionById,
  );
export default router;
