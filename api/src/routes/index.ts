import { Router } from "express";
import userRouter from "../modules/user/user.route";

const router = Router();

const modulesRutes = [{ path: "/users", route: userRouter }];

modulesRutes.forEach((route) => router.use(route.path, route.route));
export default router;

