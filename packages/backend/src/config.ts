/**
 * アプリケーション設定
 */

// デバッグ: 環境変数を出力
console.log('[config] DATABASE_URL:', process.env['DATABASE_URL'] ? 'SET' : 'NOT SET')
console.log('[config] REDIS_URL:', process.env['REDIS_URL'] ? 'SET' : 'NOT SET')
console.log('[config] NODE_ENV:', process.env['NODE_ENV'])

const databaseUrl = process.env['DATABASE_URL'] ??
  process.env['POSTGRES_URL'] ??
  process.env['DATABASE_PRIVATE_URL'] ??
  'postgresql://medieval:medieval_pass@localhost:5432/medieval_life'

console.log('[config] Using DB host:', new URL(databaseUrl).hostname)

export const config = {
  port: parseInt(process.env['PORT'] ?? '4000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl,
  redisUrl: (
    process.env['REDIS_URL'] ??
    process.env['REDIS_PRIVATE_URL'] ??
    'redis://localhost:6379'
  ),
  jwtSecret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
  isDev: process.env['NODE_ENV'] !== 'production',
} as const
