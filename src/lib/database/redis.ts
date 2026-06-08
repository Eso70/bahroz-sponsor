import Redis from "ioredis";

declare module "ioredis" {
  interface Redis {
    popBatch(key: string, limit: number): Promise<string[]>;
  }
}

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

let redis: Redis | null = null;
let isRedisAvailable = false;

if (typeof window === "undefined") {
  try {
    redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: 1, // Fail fast if Redis is down
      reconnectOnError: () => true,
    });

    // Register popBatch custom command for atomic queue popping
    redis.defineCommand("popBatch", {
      numberOfKeys: 1,
      lua: `
        local limit = tonumber(ARGV[1])
        local items = redis.call('lrange', KEYS[1], 0, limit - 1)
        if #items > 0 then
          redis.call('ltrim', KEYS[1], #items, -1)
        end
        return items
      `,
    });

    redis.on("connect", () => {
      console.log(`📡 Redis connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
      isRedisAvailable = true;
    });

    redis.on("error", (err) => {
      console.warn("⚠️ Redis client connection error:", err.message);
      isRedisAvailable = false;
    });
  } catch (error) {
    console.error("❌ Failed to initialize Redis client:", error);
    redis = null;
    isRedisAvailable = false;
  }
}

/**
 * Get the underlying Redis client instance
 */
export function getRedisClient(): Redis | null {
  return redis;
}

/**
 * Check if Redis is connected and available
 */
export function isCacheAvailable(): boolean {
  return isRedisAvailable && redis !== null;
}

/**
 * Safe wrapper to retrieve a cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis || !isRedisAvailable) return null;
  
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`⚠️ Redis cache get error for key "${key}":`, error);
    return null;
  }
}

/**
 * Safe wrapper to write a cached value with a TTL (in seconds)
 */
export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 7200
): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;
  
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.warn(`⚠️ Redis cache set error for key "${key}":`, error);
    return false;
  }
}

/**
 * Safe wrapper to delete a cached value
 */
export async function delCache(key: string): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`⚠️ Redis cache delete error for key "${key}":`, error);
    return false;
  }
}

/**
 * Track an admin session token in a Redis set to group it under the admin's ID
 */
export async function trackAdminSession(
  adminId: string,
  sessionToken: string,
  ttlSeconds: number
): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;
  try {
    const key = `admin:sessions:${adminId}`;
    await redis.sadd(key, sessionToken);
    // Set expiry to matching session duration
    await redis.expire(key, ttlSeconds);
    return true;
  } catch (error) {
    console.warn(`⚠️ Redis error tracking session for admin "${adminId}":`, error);
    return false;
  }
}

/**
 * Remove a single session token from the admin's session set
 */
export async function untrackAdminSession(
  adminId: string,
  sessionToken: string
): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;
  try {
    const key = `admin:sessions:${adminId}`;
    await redis.srem(key, sessionToken);
    return true;
  } catch (error) {
    console.warn(`⚠️ Redis error untracking session for admin "${adminId}":`, error);
    return false;
  }
}

/**
 * Invalidate all cached sessions for a given admin ID
 */
export async function clearAdminSessions(adminId: string): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;
  try {
    const key = `admin:sessions:${adminId}`;
    const tokens = await redis.smembers(key);
    
    const pipeline = redis.pipeline();
    for (const token of tokens) {
      pipeline.del(`session:${token}`);
    }
    pipeline.del(key);
    await pipeline.exec();
    
    return true;
  } catch (error) {
    console.warn(`⚠️ Redis error clearing sessions for admin "${adminId}":`, error);
    return false;
  }
}

/**
 * Check if a key (e.g., rate:limit:tracking:IP) has exceeded a limit within windowSeconds
 */
export async function isRateLimited(
  key: string,
  limit = 60,
  windowSeconds = 60
): Promise<boolean> {
  if (!redis || !isRedisAvailable) return false;
  
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    return current > limit;
  } catch (error) {
    console.warn(`⚠️ Redis rate limit error for key "${key}":`, error);
    return false;
  }
}
