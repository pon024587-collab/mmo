/**
 * アプリケーション設定
 * 環境変数から設定値を読み込む
 */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`)
  }
  return value
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '4000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl: process.env['DATABASE_URL'] ?? process.env['POSTGRES_URL'] ?? requireEnv('DATABASE_URL'),
  redisUrl: process.env['REDIS_URL'] ?? process.env['REDIS_PRIVATE_URL'] ?? 'redis://localhost:6379',
  jwtSecret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
  isDev: process.env['NODE_ENV'] !== 'production',
} as const
