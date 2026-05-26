/**
 * アプリケーション設定
 */

const databaseUrl = process.env['DATABASE_URL'] ||
  'postgresql://postgres:KkqTaATPTJpHGXRdFXcTbfgyaaQjmtdu@postgres.railway.internal:5432/railway'

const redisUrl = process.env['REDIS_URL'] ||
  'redis://default:oJuXfnKlPohBpqxKbXzyVHBHzMRGVZnc@redis.railway.internal:6379'

console.log('[config] NODE_ENV:', process.env['NODE_ENV'])
console.log('[config] DB host:', new URL(databaseUrl).hostname)
console.log('[config] Redis host:', new URL(redisUrl).hostname)

export const config = {
  port: parseInt(process.env['PORT'] || '4000', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  databaseUrl,
  redisUrl,
  jwtSecret: process.env['JWT_SECRET'] || 'medieval-life-secret-2024-xK9mP3nQ7rL',
  isDev: process.env['NODE_ENV'] !== 'production',
} as const
