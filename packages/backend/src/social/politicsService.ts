/**
 * 政治参加システム
 */
import { sql } from '../db/client.js'

/** 村長選挙を開始する（World_Tickで720時間ごとに呼び出す） */
export async function startMayorElection(villageId: string): Promise<void> {
  // 選挙期間を24時間設定
  const electionEnd = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await sql`
    INSERT INTO system_config (key, value)
    VALUES (${`election_${villageId}`}, ${electionEnd.toISOString()})
    ON CONFLICT (key) DO UPDATE SET value = ${electionEnd.toISOString()}, updated_at = NOW()
  `
}

/** 村長に立候補する */
export async function runForMayor(
  characterId: string,
  villageId: string
): Promise<{ success: boolean; message?: string }> {
  // Reputation確認（簡略化: NPC関係値の平均）
  const avg = await sql<{ avg: number }[]>`
    SELECT COALESCE(AVG(cnr.relation_value), 0) as avg
    FROM character_npc_relations cnr
    JOIN npcs n ON cnr.npc_id = n.id
    WHERE cnr.character_id = ${characterId} AND n.village_id = ${villageId}
  `
  if ((avg[0]?.avg ?? 0) < 20) {
    return { success: false, message: '村での評判が足りません。もっと村人と交流してください。' }
  }

  await sql`
    INSERT INTO system_config (key, value)
    VALUES (${`candidate_${villageId}_${characterId}`}, 'true')
    ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = NOW()
  `
  return { success: true, message: '村長選挙に立候補しました。村人たちが投票します。' }
}

/** 国王に請願する */
export async function petition(
  characterId: string,
  content: string
): Promise<{ success: boolean; message?: string }> {
  const char = await sql<{ nationId: string }[]>`
    SELECT nation_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, message: 'キャラクターが見つかりません。' }

  // Reputation確認
  const avg = await sql<{ avg: number }[]>`
    SELECT COALESCE(AVG(cnr.relation_value), 0) as avg
    FROM character_npc_relations cnr
    JOIN npcs n ON cnr.npc_id = n.id
    JOIN villages v ON n.village_id = v.id
    WHERE cnr.character_id = ${characterId} AND v.nation_id = ${char[0].nationId}
  `
  const rep = avg[0]?.avg ?? 0
  const acceptChance = Math.min(0.8, Math.max(0.1, rep / 100))
  const accepted = Math.random() < acceptChance

  if (accepted) {
    // 請願内容に応じてNationパラメーターを変更
    if (content.includes('減税')) {
      await sql`
        UPDATE nations SET tax_rate = GREATEST(5, tax_rate - 2) WHERE id = ${char[0].nationId}
      `
    }
    return { success: true, message: '国王は請願を受け入れた。' }
  }

  return { success: false, message: '国王は請願を却下した。' }
}
