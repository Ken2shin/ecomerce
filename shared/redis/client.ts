import Redis from 'ioredis';
import { Logger } from '../logger/logger';

const logger = new Logger('Redis');

// Redis singleton instance
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });
  }

  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Caching utilities
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const value = await client.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value as unknown as T;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): Promise<void> {
  const client = getRedisClient();
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  await client.setex(key, ttlSeconds, stringValue);
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

export async function cachePattern(pattern: string): Promise<string[]> {
  const client = getRedisClient();
  return client.keys(pattern);
}

export async function cacheClear(pattern: string = '*'): Promise<void> {
  const client = getRedisClient();
  const keys = await cachePattern(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
}

// Rate limiting
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const client = getRedisClient();
  const current = await client.incr(key);
  
  if (current === 1) {
    await client.expire(key, windowSeconds);
  }

  return current <= limit;
}

// Session management
export async function setSession(
  userId: string,
  sessionData: Record<string, any>,
  ttlSeconds: number = 2592000 // 30 days
): Promise<void> {
  const key = `session:${userId}`;
  await cacheSet(key, sessionData, ttlSeconds);
}

export async function getSession(userId: string): Promise<Record<string, any> | null> {
  const key = `session:${userId}`;
  return cacheGet(key);
}

export async function deleteSession(userId: string): Promise<void> {
  const key = `session:${userId}`;
  await cacheDel(key);
}
