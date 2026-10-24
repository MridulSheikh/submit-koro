import { Router } from "express";
import userRouter from "../modules/user/user.route";
import submissionRouter from "../modules/submission/submission.route";
import reviewRouter from "../modules/review/review.route";
import roleRouter from "../modules/role/role.route";
import overviewRouter from "../modules/overview/overview.route";

const router = Router();

const modulesRutes = [
  { path: "/users", route: userRouter },
  { path: "/submission", route: submissionRouter },
  { path: "/review", route: reviewRouter },
  { path: "/roles", route: roleRouter },
  { path: "/overview", route: overviewRouter },
];

modulesRutes.forEach((route) => router.use(route.path, route.route));
export default router;
