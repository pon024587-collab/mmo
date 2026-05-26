/**
 * 結婚・家族システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

/** 求婚する */
export async function propose(characterId: string, npcId: string): Promise<RegisterActionResult> {
  const relation = await sql<{ relationValue: number }[]>`
    SELECT relation_value FROM character_npc_relations
    WHERE character_id = ${characterId} AND npc_id = ${npcId} LIMIT 1
  `
  if (!relation[0] || relation[0].relationValue < 90) {
    return {
      success: false,
      errorCode: 'MISSING_PREREQUISITE',
      message: 'まだ親密さが足りません。もっと交流を深めてください。',
    }
  }

  // 既婚確認
  const married = await sql<{ id: string }[]>`
    SELECT id FROM marriages WHERE character_id = ${characterId} AND is_active = true LIMIT 1
  `
  if (married[0]) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: 'すでに結婚しています。' }
  }

  return registerAction({ characterId, actionType: 'PROPOSE', parameters: { npcId } })
}

/** 求婚完了時の処理 */
export async function completePropose(characterId: string, npcId: string): Promise<string> {
  const npc = await sql<{ name: string; personalityParams: Record<string, number> }[]>`
    SELECT name, personality_params FROM npcs WHERE id = ${npcId} LIMIT 1
  `
  if (!npc[0]) return '求婚できませんでした。'

  // NPCの性格に基づいて承諾・拒否を決定
  const acceptChance = 0.7 + (npc[0].personalityParams['openness'] ?? 0) / 200
  const accepted = Math.random() < acceptChance

  if (accepted) {
    await sql`
      INSERT INTO marriages (character_id, spouse_npc_id)
      VALUES (${characterId}, ${npcId})
    `
    return `${npc[0].name}は笑顔で頷いた。「はい、喜んで」`
  } else {
    return `${npc[0].name}は申し訳なさそうに首を振った。「ごめんなさい…まだ心の準備ができていません」`
  }
}

/** 子供誕生チェック（World_Tickで呼び出す） */
export async function checkChildBirth(): Promise<void> {
  // 結婚後180時間経過した夫婦に子供誕生イベント
  const marriages = await sql<{ id: string; characterId: string; spouseNpcId: string }[]>`
    SELECT id, character_id, spouse_npc_id FROM marriages
    WHERE is_active = true
      AND married_at < NOW() - INTERVAL '180 hours'
      AND id NOT IN (SELECT marriage_id FROM children WHERE marriage_id IS NOT NULL)
  `

  for (const marriage of marriages) {
    if (Math.random() < 0.3) { // 30%の確率で誕生
      const char = await sql<{ villageId: string }[]>`
        SELECT village_id FROM characters WHERE id = ${marriage.characterId} LIMIT 1
      `
      if (!char[0]) continue

      // 子供NPCを村に追加
      await sql`
        INSERT INTO npcs (village_id, name, role, personality_params)
        VALUES (${char[0].villageId}, '子供', 'FARMER', '{}')
      `
    }
  }
}
