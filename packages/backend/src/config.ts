/**
 * アプリケーション設定
 * 環境変数から設定値を読み込む
 */

export const config = {
  port: parseInt(process.env['PORT'] ?? '4000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl: (
    process.env['DATABASE_URL'] ??
    process.env['POSTGRES_URL'] ??
    process.env['DATABASE_PRIVATE_URL'] ??
    'postgresql://medieval:medieval_pass@localhost:5432/medieval_life'
  ),
  redisUrl: (
    process.env['REDIS_URL'] ??
    process.env['REDIS_PRIVATE_URL'] ??
    'redis://localhost:6379'
  ),
  jwtSecret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
  isDev: process.env['NODE_ENV'] !== 'production',
} as const
// force rebuild 05/26/2026 11:46:16
