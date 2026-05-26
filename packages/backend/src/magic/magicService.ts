/**
 * 魔法システム
 * 魔法書習得・MP管理・Skill_Growth蓄積
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

export type MagicCategory = 'ATTACK' | 'HEAL' | 'SUPPORT' | 'LIFE'

export interface LearnedSpell {
  name: string
  category: MagicCategory
  mpCost: number
}

const SPELL_BOOK_MAP: Record<string, LearnedSpell> = {
  SPELL_BOOK_FIRE:  { name: '火球', category: 'ATTACK',  mpCost: 15 },
  SPELL_BOOK_HEAL:  { name: '治癒', category: 'HEAL',    mpCost: 10 },
  SPELL_BOOK_THUNDER: { name: '雷撃', category: 'ATTACK', mpCost: 20 },
  SPELL_BOOK_BUFF:  { name: '強化', category: 'SUPPORT', mpCost: 8  },
  SPELL_BOOK_CROP:  { name: '作物成長促進', category: 'LIFE', mpCost: 5 },
}

/** 魔法書から魔法を学ぶ */
export async function studyMagic(
  characterId: string,
  spellBookItemId: string
): Promise<RegisterActionResult> {
  const item = await sql<{ id: string; itemTemplateName: string }[]>`
    SELECT i.id, it.name as item_template_name
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.id = ${spellBookItemId}
      AND i.owner_character_id = ${characterId}
      AND it.category = 'MAGIC_TOOL'
    LIMIT 1
  `
  if (!item[0]) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '魔法書が見つかりません。' }
  }
  if (!SPELL_BOOK_MAP[item[0].itemTemplateName]) {
    return { success: false, errorCode: 'INVALID_TARGET', message: 'この魔法書は習得できません。' }
  }

  return registerAction({
    characterId,
    actionType: 'STUDY_MAGIC',
    parameters: { spellBookItemId, spellBookName: item[0].itemTemplateName },
    durationOverrideMinutes: 240,
  })
}

/** 魔法学習完了時の処理 */
export async function completeStudyMagic(
  characterId: string,
  spellBookName: string
): Promise<string> {
  const spell = SPELL_BOOK_MAP[spellBookName]
  if (!spell) return '魔法の習得に失敗した。'

  // 習得魔法リストに追加（learned_spells テーブル）
  await sql`
    INSERT INTO learned_spells (character_id, spell_name, category, mp_cost)
    VALUES (${characterId}, ${spell.name}, ${spell.category}, ${spell.mpCost})
    ON CONFLICT (character_id, spell_name) DO NOTHING
  `

  // 魔法Skill_Growth蓄積
  await sql`
    UPDATE characters
    SET skill_magic_growth = skill_magic_growth + ${Math.floor(Math.random() * 5) + 3}
    WHERE id = ${characterId}
  `

  const skillRows = await sql<{ skillMagicGrowth: number }[]>`
    SELECT skill_magic_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const skill = skillRows[0]?.skillMagicGrowth ?? 0

  if (skill < 50) return `呪文を唱えてみたが、${spell.name}の炎は小さかった。それでも何かを掴んだ気がする。`
  if (skill < 200) return `${spell.name}を習得した。安定して発動できるようになった。`
  return `${spell.name}の詠唱が完璧になった。詠唱と同時に魔法が放たれる感覚がある。`
}

/** 魔法使用（戦闘中） */
export async function castSpell(
  characterId: string,
  spellName: string
): Promise<{ success: boolean; effectText: string; mpUsed?: number }> {
  const char = await sql<{ mp: number; mpMax: number; skillMagicGrowth: number }[]>`
    SELECT mp, mp_max, skill_magic_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, effectText: 'キャラクターが見つかりません。' }

  const spell = await sql<{ mpCost: number; category: string }[]>`
    SELECT mp_cost, category FROM learned_spells
    WHERE character_id = ${characterId} AND spell_name = ${spellName} LIMIT 1
  `
  if (!spell[0]) return { success: false, effectText: `${spellName}を習得していません。` }

  if (char[0].mp < spell[0].mpCost) {
    return { success: false, effectText: `MPが足りません。（必要: ${spell[0].mpCost}、現在: ${char[0].mp}）` }
  }

  // MP消費
  await sql`
    UPDATE characters SET mp = mp - ${spell[0].mpCost}, updated_at = NOW()
    WHERE id = ${characterId}
  `

  // Skill_Growth蓄積
  await sql`
    UPDATE characters
    SET skill_magic_growth = skill_magic_growth + ${Math.floor(Math.random() * 2) + 1}
    WHERE id = ${characterId}
  `

  const skill = char[0].skillMagicGrowth
  const effectText = generateSpellText(spellName, skill)

  return { success: true, effectText, mpUsed: spell[0].mpCost }
}

function generateSpellText(spellName: string, skill: number): string {
  if (skill < 50) return `${spellName}を唱えたが、効果は小さかった。`
  if (skill < 200) return `${spellName}が安定して発動した。`
  return `${spellName}が完璧に炸裂した。`
}
