/**
 * 病気・怪我・治療システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

export type InjuryType = 'MINOR' | 'SERIOUS' | 'BROKEN_BONE'

const INJURY_NAMES: Record<InjuryType, string> = {
  MINOR:       '軽傷',
  SERIOUS:     '重傷',
  BROKEN_BONE: '骨折',
}

/** 負傷を付与する */
export async function applyInjury(characterId: string, injuryType: InjuryType): Promise<void> {
  await sql`
    UPDATE characters
    SET is_injured = true, updated_at = NOW()
    WHERE id = ${characterId}
  `
  // injury_records テーブルに記録（簡略化: characters.is_injured フラグで管理）
}

/** 治療を受ける */
export async function seekTreatment(characterId: string): Promise<RegisterActionResult> {
  const char = await sql<{ isInjured: boolean; isSick: boolean; villageId: string }[]>`
    SELECT is_injured, is_sick, village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'キャラクターが見つかりません。' }
  if (!char[0].isInjured && !char[0].isSick) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '怪我も病気もしていません。' }
  }

  // 村に医師NPCがいるか確認
  const doctor = await sql<{ id: string }[]>`
    SELECT id FROM npcs
    WHERE village_id = ${char[0].villageId} AND role = 'DOCTOR' AND is_alive = true
    LIMIT 1
  `
  if (!doctor[0]) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: 'この村に医師がいません。' }
  }

  return registerAction({ characterId, actionType: 'TREAT', durationOverrideMinutes: 120 })
}

/** 治療完了時の処理 */
export async function completeTreatment(characterId: string): Promise<string> {
  await sql`
    UPDATE characters
    SET is_injured = false, is_sick = false,
        health = LEAST(health_max, health + 20),
        updated_at = NOW()
    WHERE id = ${characterId}
  `
  return '医師に診てもらった。傷が癒え、体が楽になった。'
}

/** 疫病感染判定（World_Tickで呼び出す） */
export async function checkContagion(characterId: string, villageId: string): Promise<void> {
  // 同じ村に病気のNPCがいるか確認
  const sickNpcs = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM npcs
    WHERE village_id = ${villageId} AND is_sick = true
  `
  const sickCount = parseInt(sickNpcs[0]?.count ?? '0')
  if (sickCount === 0) return

  // 感染確率（病人が多いほど高い）
  const infectionChance = Math.min(0.3, sickCount * 0.05)
  if (Math.random() < infectionChance) {
    await sql`
      UPDATE characters
      SET is_sick = true, updated_at = NOW()
      WHERE id = ${characterId} AND is_sick = false
    `
  }
}

/** 放置による怪我悪化（World_Tickで呼び出す） */
export async function processInjuryDegradation(): Promise<void> {
  // 24時間以上治療を受けていない負傷キャラクターの体力を減少
  await sql`
    UPDATE characters
    SET health = GREATEST(0, health - 3), updated_at = NOW()
    WHERE is_injured = true
      AND status != 'INACTIVE'
      AND updated_at < NOW() - INTERVAL '24 hours'
  `
}
