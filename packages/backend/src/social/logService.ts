import { sql } from '../db/client.js'

export async function addGlobalLog(message: string, type: 'INFO' | 'CRAFT' | 'COMBAT' | 'RAID' = 'INFO') {
  await sql`
    INSERT INTO global_logs (message, type) VALUES (${message}, ${type})
  `
}

export async function getGlobalLogs(limit: number = 5) {
  const logs = await sql<{ message: string; type: string; created_at: Date }[]>`
    SELECT message, type, created_at FROM global_logs
    ORDER BY created_at DESC LIMIT ${limit}
  `
  return logs
}
