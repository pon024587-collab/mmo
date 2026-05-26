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
    column: (col: string) => col.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
  },
})
