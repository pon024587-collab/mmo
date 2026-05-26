import { Redis } from 'ioredis'
import { config } from '../config.js'

/**
 * BullMQ用Redisクライアント（シングルトン）
 */
let redisInstance: Redis | null = null

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null, // BullMQ要件
      enableReadyCheck: false,
    })
  }
  return redisInstance
}

export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit()
    redisInstance = null
  }
}
