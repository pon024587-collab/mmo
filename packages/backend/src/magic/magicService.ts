/**
 * 魔法システム
 * アクティブな魔法使用（回復・支援など）
 */
import { sql } from '../db/client.js'

export async function getAvailableSpells(characterId: string) {
  const skills = await sql<{ skillCategory: string; exp: number }[]>`
    SELECT skill_category, exp FROM character_skills 
    WHERE character_id = ${characterId} AND skill_category LIKE 'MAGIC_%' AND exp > 0
  `
  
  const spells = []
  for (const s of skills) {
    if (s.skillCategory === 'MAGIC_LIFE') {
      spells.push({ id: 'HEAL', name: '治癒魔法', description: 'HPを回復する', mpCost: 15, exp: s.exp })
    }
    if (s.skillCategory === 'MAGIC_LIGHT') {
      spells.push({ id: 'PURIFY', name: '浄化魔法', description: '疲労とストレスを軽減する', mpCost: 20, exp: s.exp })
    }
    // 戦闘用魔法は現在パッシブ発動なのでアクティブには出さない
  }
  return spells
}

export async function castActiveSpell(
  characterId: string,
  spellId: string
): Promise<{ success: boolean; message: string }> {
  const char = await sql<{ mp: number; health: number; healthMax: number; fatigueInternal: number; stressInternal: number }[]>`
    SELECT mp, health, health_max, fatigue_internal, stress_internal FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, message: 'キャラクターが見つかりません。' }

  const spells = await getAvailableSpells(characterId)
  const spell = spells.find(s => s.id === spellId)

  if (!spell) {
    return { success: false, message: 'その魔法は習得していません。関連する魔物と戦ってスキルを磨いてください。' }
  }

  if (char[0].mp < spell.mpCost) {
    return { success: false, message: `MPが足りません。（必要: ${spell.mpCost}、現在: ${char[0].mp}）` }
  }

  // 魔法の効果量（スキル経験値に応じた補正）
  const powerBonus = Math.floor(Math.sqrt(spell.exp))

  await sql.begin(async tx => {
    // MP消費
    await tx`UPDATE characters SET mp = mp - ${spell.mpCost} WHERE id = ${characterId}`
    
    // スキル経験値も少し入る
    const category = spellId === 'HEAL' ? 'MAGIC_LIFE' : 'MAGIC_LIGHT'
    await tx`
      UPDATE character_skills SET exp = exp + 1 
      WHERE character_id = ${characterId} AND skill_category = ${category}
    `

    // 効果適用
    if (spellId === 'HEAL') {
      const healAmount = 20 + powerBonus
      await tx`UPDATE characters SET health = LEAST(health_max, health + ${healAmount}) WHERE id = ${characterId}`
    } else if (spellId === 'PURIFY') {
      const cureAmount = 15 + Math.floor(powerBonus / 2)
      await tx`
        UPDATE characters 
        SET fatigue_internal = GREATEST(0, fatigue_internal - ${cureAmount}),
            stress_internal = GREATEST(0, stress_internal - ${cureAmount})
        WHERE id = ${characterId}
      `
    }
  })

  return { success: true, message: `${spell.name}を唱えた！` }
}

