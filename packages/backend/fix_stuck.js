import { sql } from './src/db/client.js'

async function check() {
  await sql`UPDATE characters SET status = 'IMPRISONED' WHERE is_imprisoned = true`
  const chars = await sql`SELECT id, name, status, is_imprisoned FROM characters WHERE is_imprisoned = true`
  console.log('Fixed stuck imprisoned characters:', chars)
  
  // also fix any ghost active actions
  await sql`UPDATE characters SET status = 'IDLE' WHERE status = 'ACTIVE_ACTION' AND id NOT IN (SELECT character_id FROM action_queue WHERE status = 'ACTIVE') AND is_imprisoned = false`
  const chars2 = await sql`SELECT id, name, status FROM characters WHERE status = 'ACTIVE_ACTION'`
  console.log('Remaining active characters:', chars2)
  process.exit(0)
}
check()
