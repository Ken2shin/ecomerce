import Redlock from 'redlock';
import { getRedisClient } from '../redis/client';
import { Logger } from '../logger/logger';

const logger = new Logger('Mutex');

let redlock: Redlock | null = null;

export function getRedlock(): Redlock {
  if (!redlock) {
    const client = getRedisClient();
    redlock = new Redlock([client], {
      driftFactor: 0.01,
      retryCount: 3,
      retryDelay: 200,
      retryJitter: 200,
    });

    redlock.on('error', (error) => {
      logger.error('Redlock error:', error);
    });
  }

  return redlock;
}

/**
 * Acquire a distributed lock with automatic TTL
 * @param key Lock key (e.g., 'checkout:userId')
 * @param duration Lock duration in milliseconds (default: 30 seconds)
 * @returns Lock object
 */
export async function acquireLock(
  key: string,
  duration: number = 30000
): Promise<Redlock.Lock> {
  const rl = getRedlock();
  try {
    logger.debug(`Acquiring lock: ${key}`);
    const lock = await rl.lock(key, duration);
    logger.debug(`Lock acquired: ${key}`);
    return lock;
  } catch (error) {
    logger.error(`Failed to acquire lock: ${key}`, error);
    throw new Error(`Could not acquire lock for ${key}`);
  }
}

/**
 * Release a lock
 * @param lock Lock object from acquireLock
 */
export async function releaseLock(lock: Redlock.Lock): Promise<void> {
  try {
    await lock.unlock();
    logger.debug('Lock released');
  } catch (error) {
    logger.error('Failed to release lock:', error);
  }
}

/**
 * Execute a function with a distributed lock
 * @param key Lock key
 * @param fn Function to execute
 * @param duration Lock duration in milliseconds
 * @returns Result of function
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  duration: number = 30000
): Promise<T> {
  const lock = await acquireLock(key, duration);
  try {
    return await fn();
  } finally {
    await releaseLock(lock);
  }
}

/**
 * Mutex for checkout transactions
 * Prevents race conditions on inventory and payment processing
 */
export async function checkoutMutex<T>(
  userId: string,
  fn: () => Promise<T>
): Promise<T> {
  return withLock(`checkout:${userId}`, fn, 30000);
}

/**
 * Mutex for inventory operations
 * Prevents race conditions on stock updates
 */
export async function inventoryMutex<T>(
  productId: string,
  fn: () => Promise<T>
): Promise<T> {
  return withLock(`inventory:${productId}`, fn, 10000);
}

/**
 * Mutex for payment operations
 * Prevents duplicate payments
 */
export async function paymentMutex<T>(
  orderId: string,
  fn: () => Promise<T>
): Promise<T> {
  return withLock(`payment:${orderId}`, fn, 15000);
}
