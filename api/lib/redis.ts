import { createClient } from "redis";
import config from "../src/config";

if (!config.REDIS_URL) {
  throw new Error("REDIS_URL must be set to enable Redis caching.");
}

const redis = createClient({ url: config.REDIS_URL });

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
};

export const getCachedValue = async (key: string): Promise<string | null> => {
  try {
    if (!redis.isReady) return null;
    return await redis.get(key);
  } catch (error) {
    console.error(`Failed to read Redis cache key "${key}":`, error);
    return null;
  }
};

export const setCachedValue = async (
  key: string,
  value: string,
  ttlSeconds: number,
) => {
  try {
    if (!redis.isReady) return;
    await redis.set(key, value, { EX: ttlSeconds });
  } catch (error) {
    console.error(`Failed to write Redis cache key "${key}":`, error);
  }
};

export const deleteCachedValue = async (key: string) => {
  try {
    if (!redis.isReady) return;
    await redis.del(key);
  } catch (error) {
    console.error(`Failed to delete Redis cache key "${key}":`, error);
  }
};

export const incrementRateLimitCounter = async (
  key: string,
  ttlSeconds: number,
) => {
  if (!redis.isReady) {
    throw new Error("Redis is not ready; cannot enforce the rate limit.");
  }

  const result = await redis.eval(
    `local count = redis.call("INCR", KEYS[1])
    if count == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return { count, redis.call("TTL", KEYS[1]) }`,
    {
      keys: [key],
      arguments: [String(ttlSeconds)],
    },
  );

  if (
    !Array.isArray(result) ||
    typeof result[0] !== "number" ||
    typeof result[1] !== "number"
  ) {
    throw new Error("Redis returned an invalid rate-limit counter.");
  }

  return { count: result[0], ttlSeconds: result[1] };
};

export const disconnectRedis = async () => {
  if (redis.isOpen) {
    await redis.quit();
  }
};
