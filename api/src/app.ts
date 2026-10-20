import express, { Application, Request, Response } from "express";
import config from "./config";
import cookieParser from "cookie-parser";
import cors from "cors";
import allRoutes from "./routes/index";
import globalErrorHandler from "./middleware/globalErrorHandlers";
import notFound from "./middleware/notFoundError";
import sendResponse from "./utils/sendResponse";
import httpStatus from "http-status";

const app: Application = express();

// Dynamically determine client URL
const client_url = config.CLIENT_URL as string;

// Middleware: JSON and cookie parser
app.use(express.json());
app.use(cookieParser());

// Enable CORS with credentials
app.use(
  cors({
    origin: client_url,
    credentials: true,
  }),
);

// App helath
app.get("/health", async (req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Healthy!",
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
