import { sql } from './src/db/client.js'

async function check() {
  const chars = await sql`SELECT id, name, status, is_imprisoned FROM characters`
  console.log(chars)
  process.exit(0)
}
check()
