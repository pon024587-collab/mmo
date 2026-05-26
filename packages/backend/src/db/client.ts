import postgres from 'postgres'
import { config } from '../config.js'

/**
 * PostgreSQLクライアント（シングルトン）
 */
export const sql = postgres(config.databaseUrl, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  transform: {
    // snake_case → camelCase の自動変換
    column: postgres.camel,
  },
})
