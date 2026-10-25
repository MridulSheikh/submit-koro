import express, { Application, Request, Response } from "express";
import config from "./config";
import cookieParser from "cookie-parser";
import cors from "cors";
import allRoutes from "./routes/index";
import globalErrorHandler from "./middleware/globalErrorHandlers";
import limit from "./middleware/limit";
import notFound from "./middleware/notFoundError";
import sendResponse from "./utils/sendResponse";
import httpStatus from "http-status";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app: Application = express();

// Render sits behind a proxy; trust its forwarded client IP for rate limits.
app.set("trust proxy", 1);

// Dynamically determine client URL
const client_url = config.CLIENT_URL as string;

// Enable CORS 
app.use(
  cors({
    origin: client_url,
    credentials: true
  }),
);

// Middleware: JSON and cookie parser
app.use(express.json());
app.use(cookieParser());

const authRateLimit = limit("auth");
app.use("/api/auth/sign-in/email", authRateLimit);
app.use("/api/auth/sign-up/email", authRateLimit);
app.use("/api/auth/send-verification-email", authRateLimit);
app.all('/api/auth/{*any}', toNodeHandler(auth));

// App helath
app.get("/health", async (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Server is Running",
    success: true,
    data: null,
  });
});

// API routes
app.use("/api", allRoutes);

// Global error handler
app.use(globalErrorHandler);

// Not found (404) middleware
app.use(notFound);

export default app;
