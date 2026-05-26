/**
 * 戦闘・魔物システム
 * テキストベースの戦闘結果生成
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

export type MonsterType =
  | 'GOBLIN' | 'ORC' | 'WOLF' | 'BANDIT'
  | 'TROLL' | 'DARK_ELF' | 'DRAGON' | 'UNDEAD'

interface MonsterStats {
  name: string
  basePower: number
  dropItems: string[]
  xpReward: number
}

const MONSTERS: Record<MonsterType, MonsterStats> = {
  GOBLIN:   { name: 'ゴブリン',     basePower: 10,  dropItems: ['IRON_ORE'],  xpReward: 5  },
  ORC:      { name: 'オーク',       basePower: 25,  dropItems: ['MEAT', 'IRON_ORE'], xpReward: 15 },
  WOLF:     { name: '狼',           basePower: 15,  dropItems: ['MEAT', 'FUR_COAT'],  xpReward: 8  },
  BANDIT:   { name: '盗賊',         basePower: 20,  dropItems: ['SWORD'],      xpReward: 12 },
  TROLL:    { name: 'トロル',       basePower: 40,  dropItems: ['STONE'],      xpReward: 25 },
  DARK_ELF: { name: 'ダークエルフ', basePower: 35,  dropItems: ['SPELL_BOOK_FIRE'], xpReward: 30 },
  DRAGON:   { name: 'ドラゴン',     basePower: 100, dropItems: ['SPELL_BOOK_FIRE', 'ARMOR'], xpReward: 100 },
  UNDEAD:   { name: 'アンデッド',   basePower: 30,  dropItems: ['HERB'],       xpReward: 20 },
}

/** 戦闘開始 */
export async function startCombat(
  characterId: string,
  monsterType: MonsterType
): Promise<RegisterActionResult> {
  const char = await sql<{ skillCombatGrowth: number; health: number }[]>`
    SELECT skill_combat_growth, health FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'キャラクターが見つかりません。' }

  const monster = MONSTERS[monsterType]
  if (!monster) return { success: false, errorCode: 'INVALID_TARGET', message: '無効な魔物です。' }

  // 戦闘所要時間（魔物の強さに応じて3〜30分）
  const durationMinutes = Math.max(3, Math.min(30, Math.floor(monster.basePower / 4)))

  return registerAction({
    characterId,
    actionType: 'COMBAT_MONSTER',
    parameters: { monsterType },
    durationOverrideMinutes: durationMinutes,
  })
}

/** 戦闘完了時の処理 */
export async function completeCombat(
  characterId: string,
  monsterType: MonsterType
): Promise<{ resultText: string; victory: boolean }> {
  const char = await sql<{ skillCombatGrowth: number; health: number; healthMax: number }[]>`
    SELECT skill_combat_growth, health, health_max FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { resultText: '戦闘結果を処理できませんでした。', victory: false }

  const monster = MONSTERS[monsterType]!
  const skill = char[0].skillCombatGrowth

  // 勝敗判定（スキルと魔物強度の比較）
  const playerPower = skill + Math.random() * 20
  const monsterPower = monster.basePower + Math.random() * 10
  const victory = playerPower >= monsterPower * 0.6

  if (victory) {
    // ドロップアイテム付与
    const dropItem = monster.dropItems[Math.floor(Math.random() * monster.dropItems.length)]
    if (dropItem) {
      const template = await sql<{ id: string }[]>`
        SELECT id FROM item_templates WHERE name = ${dropItem} LIMIT 1
      `
      if (template[0]) {
        await sql`
          INSERT INTO items (owner_character_id, item_template_id, quantity)
          VALUES (${characterId}, ${template[0].id}, 1)
        `
      }
    }

    // 戦闘Skill_Growth蓄積
    const growthGain = Math.floor(monster.basePower / 10) + Math.floor(Math.random() * 3)
    await sql`
      UPDATE characters
      SET skill_combat_growth = skill_combat_growth + ${growthGain}
      WHERE id = ${characterId}
    `

    return { resultText: generateVictoryText(skill, monster.name), victory: true }
  } else {
    // 敗北 → 体力を0にして死亡処理
    await sql`
      UPDATE characters SET health = 0, updated_at = NOW() WHERE id = ${characterId}
    `
    return {
      resultText: `${monster.name}との戦いに敗れた。意識が遠のいていく…`,
      victory: false,
    }
  }
}

function generateVictoryText(skillGrowth: number, monsterName: string): string {
  if (skillGrowth < 50) {
    return `なんとか${monsterName}を倒した。体中が傷だらけだ。`
  } else if (skillGrowth < 200) {
    return `${monsterName}を倒した。いい戦いだった。`
  } else if (skillGrowth < 500) {
    return `${monsterName}を鮮やかに倒した。剣筋が冴えている。`
  } else {
    return `${monsterName}を一撃で仕留めた。無駄のない動きだった。`
  }
}
