/**
 * 師匠・弟子システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

export type SkillType = 'farming' | 'combat' | 'magic' | 'social' | 'mining' | 'cooking' | 'trading'

const MENTOR_THRESHOLD = 200 // 師匠になれるSkill_Growthの最低値（非公開）

/** 弟子入りを申し込む */
export async function applyForApprenticeship(
  apprenticeId: string,
  mentorCharacterId: string | null,
  mentorNpcId: string | null,
  skillType: SkillType
): Promise<{ success: boolean; message?: string }> {
  if (!mentorCharacterId && !mentorNpcId) {
    return { success: false, message: '師匠を指定してください。' }
  }

  // 既存の師弟関係確認
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM mentor_relationships
    WHERE apprentice_character_id = ${apprenticeId}
      AND skill_type = ${skillType}
      AND expires_at > NOW()
    LIMIT 1
  `
  if (existing[0]) {
    return { success: false, message: 'すでにこのスキルの師匠がいます。' }
  }

  // プレイヤーが師匠の場合、Skill_Growth閾値を確認
  if (mentorCharacterId) {
    const skillCol = `skill_${skillType}_growth`
    const mentor = await sql<{ skillGrowth: number }[]>`
      SELECT ${sql.unsafe(skillCol)} as skill_growth
      FROM characters WHERE id = ${mentorCharacterId} LIMIT 1
    `
    if (!mentor[0] || (mentor[0].skillGrowth ?? 0) < MENTOR_THRESHOLD) {
      return { success: false, message: 'その人はまだ指導できるほどの腕前ではないようだ。' }
    }

    // 弟子の上限確認（最大5人）
    const apprenticeCount = await sql<{ count: string }[]>`
      SELECT COUNT(*) as count FROM mentor_relationships
      WHERE mentor_character_id = ${mentorCharacterId} AND expires_at > NOW()
    `
    if (parseInt(apprenticeCount[0]?.count ?? '0') >= 5) {
      return { success: false, message: 'その師匠はすでに弟子を5人抱えています。' }
    }
  }

  // 師弟関係を登録（30日間）
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await sql`
    INSERT INTO mentor_relationships
      (mentor_character_id, mentor_npc_id, apprentice_character_id, skill_type, expires_at)
    VALUES
      (${mentorCharacterId}, ${mentorNpcId}, ${apprenticeId}, ${skillType}, ${expires})
  `

  return { success: true, message: '師弟関係を結びました。指導を受けることができます。' }
}

/** 指導を受ける */
export async function receiveTraining(
  apprenticeId: string,
  skillType: SkillType,
  tuitionFee: number
): Promise<RegisterActionResult> {
  const rel = await sql<{ id: string; mentorCharacterId: string | null; mentorNpcId: string | null }[]>`
    SELECT id, mentor_character_id, mentor_npc_id
    FROM mentor_relationships
    WHERE apprentice_character_id = ${apprenticeId}
      AND skill_type = ${skillType}
      AND expires_at > NOW()
    LIMIT 1
  `
  if (!rel[0]) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: 'この分野の師匠がいません。' }
  }

  const char = await sql<{ gold: number }[]>`
    SELECT gold FROM characters WHERE id = ${apprenticeId} LIMIT 1
  `
  if (!char[0] || char[0].gold < tuitionFee) {
    return { success: false, errorCode: 'INSUFFICIENT_FUNDS', message: `授業料が足りません。必要: ${tuitionFee}G` }
  }

  return registerAction({
    characterId: apprenticeId,
    actionType: 'MENTOR_LEARN',
    parameters: { skillType, tuitionFee, mentorCharacterId: rel[0].mentorCharacterId },
    durationOverrideMinutes: 60,
  })
}

/** 指導完了時の処理 */
export async function completeTraining(
  apprenticeId: string,
  skillType: SkillType,
  tuitionFee: number,
  mentorCharacterId: string | null
): Promise<string> {
  // 授業料移転
  if (mentorCharacterId && tuitionFee > 0) {
    await sql`
      UPDATE characters SET gold = gold - ${tuitionFee}, updated_at = NOW()
      WHERE id = ${apprenticeId}
    `
    await sql`
      UPDATE characters SET gold = gold + ${tuitionFee}, updated_at = NOW()
      WHERE id = ${mentorCharacterId}
    `
    // 師匠のReputation増加
    await sql`
      UPDATE character_npc_relations SET relation_value = LEAST(100, relation_value + 3)
      WHERE character_id = ${mentorCharacterId}
    `
  }

  // 独学より多いSkill_Growth蓄積（1.5倍）
  const growthGain = Math.floor(Math.random() * 8) + 5
  const skillCol = `skill_${skillType}_growth`
  await sql`
    UPDATE characters
    SET ${sql.unsafe(skillCol)} = ${sql.unsafe(skillCol)} + ${growthGain},
        updated_at = NOW()
    WHERE id = ${apprenticeId}
  `

  const currentGrowth = await sql<{ g: number }[]>`
    SELECT ${sql.unsafe(skillCol)} as g FROM characters WHERE id = ${apprenticeId} LIMIT 1
  `
  const g = currentGrowth[0]?.g ?? 0

  if (g < 100) return '師匠の動きを真似ながら練習した。何かが少し掴めた気がする。'
  if (g < 300) return '師匠の教えが少しずつ体に染み込んできた。'
  return '師匠の指導で、今まで気づかなかった動きの本質が見えてきた。'
}

/** 期限切れの師弟関係を解消する（World_Tickで呼び出す） */
export async function cleanupExpiredRelationships(): Promise<void> {
  await sql`DELETE FROM mentor_relationships WHERE expires_at <= NOW()`
}
