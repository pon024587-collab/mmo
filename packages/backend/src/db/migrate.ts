/**
 * データベースマイグレーション
 * サーバー起動時に自動実行される
 */
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { sql } from './client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, 'migrations')

export async function runMigrations(): Promise<void> {
  // マイグレーション管理テーブルを作成
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // 適用済みマイグレーションを取得
  const applied = await sql<{ filename: string }[]>`
    SELECT filename FROM schema_migrations ORDER BY filename
  `
  const appliedSet = new Set(applied.map((r) => r.filename))

  // マイグレーションファイルを順番に適用
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (appliedSet.has(file)) continue

    console.log(`  マイグレーション適用: ${file}`)
    const sqlContent = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')

    await sql.begin(async (tx) => {
      await tx.unsafe(sqlContent)
      await tx`INSERT INTO schema_migrations (filename) VALUES (${file})`
    })
  }
}

// 直接実行された場合（pnpm migrate）
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMigrations()
    .then(() => { console.log('マイグレーション完了'); process.exit(0) })
    .catch((err) => { console.error('マイグレーション失敗:', err); process.exit(1) })
    .finally(() => sql.end())
}
