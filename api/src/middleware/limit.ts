import { RequestHandler } from "express";
import { incrementRateLimitCounter } from "../../lib/redis";
import AppError from "../errors/AppError";

const windowSeconds = 15 * 60;
const maxRequests = 100;

const limit = (scope: "auth" | "submission"): RequestHandler => {
  return async (req, res, next) => {
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      if (!ip) {
        throw new Error("Unable to determine client IP for rate limiting.");
      }

      const { count, ttlSeconds } = await incrementRateLimitCounter(
        `rate-limit:v1:${scope}:${ip}`,
        windowSeconds,
      );
      const remaining = Math.max(0, maxRequests - count);
      res.setHeader("RateLimit-Limit", maxRequests);
      res.setHeader("RateLimit-Remaining", remaining);
      res.setHeader("RateLimit-Reset", ttlSeconds);

      if (count > maxRequests) {
        res.setHeader("Retry-After", ttlSeconds);
        throw new AppError(429, "Too many requests. Please try again later.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default limit;