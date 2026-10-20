import { Router } from "express";

const router = Router();

const modulesRutes = [];

modulesRutes.forEach((route) => router.use(route.path, route.route));
export default router;