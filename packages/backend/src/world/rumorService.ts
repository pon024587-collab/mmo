/**
 * 噂・情報伝播システム
 */
import { sql } from '../db/client.js'

export type RumorEventType = 'PLAGUE' | 'WAR' | 'MONSTER_RAID' | 'HARVEST' | 'DISASTER'

/** 噂を生成する */
export async function createRumor(
  originVillageId: string,
  eventType: RumorEventType,
  content: string
): Promise<void> {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後に期限切れ
  await sql`
    INSERT INTO rumors (origin_village_id, current_village_id, content, original_content, event_type, expires_at)
    VALUES (${originVillageId}, ${originVillageId}, ${content}, ${content}, ${eventType}, ${expires})
  `
}

/** 噂を隣接Villageに伝播させる（World_Tickで呼び出す） */
export async function propagateRumors(): Promise<void> {
  const rumors = await sql<{
    id: string
    currentVillageId: string
    content: string
    eventType: string
    propagationCount: number
  }[]>`
    SELECT id, current_village_id, content, event_type, propagation_count
    FROM rumors WHERE expires_at > NOW() AND propagation_count < 5
  `

  for (const rumor of rumors) {
    // 隣接Villageを取得（同じNation内の別Village）
    const neighbors = await sql<{ id: string }[]>`
      SELECT v2.id FROM villages v1
      JOIN villages v2 ON v1.nation_id = v2.nation_id
      WHERE v1.id = ${rumor.currentVillageId}
        AND v2.id != ${rumor.currentVillageId}
        AND v2.is_abandoned = false
      ORDER BY RANDOM() LIMIT 2
    `

    for (const neighbor of neighbors) {
      // 伝言ゲームで内容が変化する可能性
      const newContent = maybeDistort(rumor.content, rumor.propagationCount)
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      await sql`
        INSERT INTO rumors (origin_village_id, current_village_id, content, original_content, event_type, propagation_count, expires_at)
        SELECT origin_village_id, ${neighbor.id}, ${newContent}, original_content, event_type, ${rumor.propagationCount + 1}, ${expires}
        FROM rumors WHERE id = ${rumor.id}
        ON CONFLICT DO NOTHING
      `
    }

    // 伝播済みとしてカウントアップ
    await sql`
      UPDATE rumors SET propagation_count = propagation_count + 1 WHERE id = ${rumor.id}
    `
  }
}

/** 噂の内容を少し変化させる（伝言ゲーム） */
function maybeDistort(content: string, count: number): string {
  if (Math.random() > 0.3 || count === 0) return content
  const distortions = [
    (s: string) => s.replace('3体', '10体'),
    (s: string) => s.replace('少し', 'かなり'),
    (s: string) => s.replace('村', '町'),
    (s: string) => s + '（らしい）',
  ]
  const fn = distortions[Math.floor(Math.random() * distortions.length)]
  return fn ? fn(content) : content
}

/** キャラクターが聞ける噂を取得する */
export async function getRumorsForVillage(villageId: string): Promise<{ content: string; eventType: string }[]> {
  return sql<{ content: string; eventType: string }[]>`
    SELECT content, event_type FROM rumors
    WHERE current_village_id = ${villageId} AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 5
  `
}
