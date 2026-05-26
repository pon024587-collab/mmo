/**
 * 戦闘・魔物システム
 * 群れ戦闘・剥ぎ取り・隠しステータス対応
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
  dropMaterials: string[]  // 剥ぎ取り素材
  dropItems: string[]      // 通常ドロップ
  minCount: number         // 群れの最小数
  maxCount: number         // 群れの最大数
}

const MONSTERS: Record<MonsterType, MonsterStats> = {
  GOBLIN:   { name: 'ゴブリン',       basePower: 10,  dropMaterials: ['ゴブリンの耳'],     dropItems: ['鉄鉱石'],  minCount: 1, maxCount: 5  },
  ORC:      { name: 'オーク',         basePower: 25,  dropMaterials: ['オークの牙'],       dropItems: ['肉'],      minCount: 1, maxCount: 3  },
  WOLF:     { name: '狼',             basePower: 15,  dropMaterials: ['狼の毛皮'],         dropItems: ['肉'],      minCount: 1, maxCount: 6  },
  BANDIT:   { name: '盗賊',           basePower: 20,  dropMaterials: ['盗賊のナイフ'],     dropItems: ['銅の剣'],  minCount: 1, maxCount: 4  },
  TROLL:    { name: 'トロル',         basePower: 40,  dropMaterials: ['トロルの皮'],       dropItems: ['石材'],    minCount: 1, maxCount: 2  },
  DARK_ELF: { name: 'ダークエルフ',   basePower: 35,  dropMaterials: ['ダークエルフの弓'], dropItems: ['魔石'],    minCount: 1, maxCount: 3  },
  DRAGON:   { name: 'ドラゴン',       basePower: 100, dropMaterials: ['竜の鱗'],           dropItems: ['竜の杖'],  minCount: 1, maxCount: 1  },
  UNDEAD:   { name: 'アンデッド',     basePower: 30,  dropMaterials: ['アンデッドの骨'],   dropItems: ['薬草'],    minCount: 2, maxCount: 8  },
}

/** 戦闘開始（群れ対応） */
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

  // 群れの数をランダムに決定
  const count = Math.floor(Math.random() * (monster.maxCount - monster.minCount + 1)) + monster.minCount
  const totalPower = monster.basePower * count

  // 戦闘所要時間（群れが多いほど長い）
  const durationMinutes = Math.max(3, Math.min(60, Math.floor(totalPower / 3)))

  return registerAction({
    characterId,
    actionType: 'COMBAT_MONSTER',
    parameters: { monsterType, count },
    durationOverrideMinutes: durationMinutes,
  })
}

/** 戦闘完了時の処理 */
export async function completeCombat(
  characterId: string,
  monsterType: MonsterType,
  count: number = 1
): Promise<{ resultText: string; victory: boolean; canSkin: boolean }> {
  const char = await sql<{ skillCombatGrowth: number; health: number; healthMax: number }[]>`
    SELECT skill_combat_growth, health, health_max FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { resultText: '戦闘結果を処理できませんでした。', victory: false, canSkin: false }

  const monster = MONSTERS[monsterType]!
  const skill = char[0].skillCombatGrowth
  const totalPower = monster.basePower * count

  // 勝敗判定
  const playerPower = skill + Math.random() * 30
  const monsterPower = totalPower + Math.random() * 10
  const victory = playerPower >= monsterPower * 0.5

  if (victory) {
    // 戦闘Skill_Growth蓄積
    const growthGain = Math.floor(totalPower / 8) + Math.floor(Math.random() * 3)
    await sql`
      UPDATE characters
      SET skill_combat_growth = skill_combat_growth + ${growthGain}
      WHERE id = ${characterId}
    `

    // 筋力成長（重い武器を使うほど成長）
    await sql`
      UPDATE characters SET strength_growth = strength_growth + 1 WHERE id = ${characterId}
    `

    // ドロップアイテム処理（ハクスラ要素）
    let dropMsg = ''
    if (monster.dropItems.length > 0 && Math.random() < 0.15) { // 15%ドロップ
      const dropName = monster.dropItems[Math.floor(Math.random() * monster.dropItems.length)]
      if (dropName) {
        const template = await sql<{ id: string; category: string }[]>`
          SELECT id, category FROM item_templates WHERE name = ${dropName} LIMIT 1
        `
        if (template[0]) {
          let meta = {}
          if (template[0].category === 'WEAPON' || template[0].category === 'ARMOR') {
            meta = generateHnsMetadata()
          }
          await sql`
            INSERT INTO items (owner_character_id, item_template_id, quantity, metadata)
            VALUES (${characterId}, ${template[0].id}, 1, ${meta})
          `
          const metaObj = meta as any
          const fullName = metaObj.rarity && metaObj.rarity !== 'NORMAL'
            ? `${metaObj.prefix || ''}${dropName}${metaObj.suffix || ''}`
            : dropName
          dropMsg = ` 戦利品: ${fullName} を手に入れた！`
        }
      }
    }

    const countText = count > 1 ? `${count}体の` : ''
    return {
      resultText: generateVictoryText(skill, monster.name, countText) + dropMsg,
      victory: true,
      canSkin: true, // 剥ぎ取り可能
    }
  } else {
    await sql`UPDATE characters SET health = 0, updated_at = NOW() WHERE id = ${characterId}`
    return {
      resultText: `${count > 1 ? `${count}体の` : ''}${monster.name}との戦いに敗れた。意識が遠のいていく…`,
      victory: false,
      canSkin: false,
    }
  }
}

/** 剥ぎ取り行動 */
export async function startSkinning(
  characterId: string,
  monsterType: MonsterType
): Promise<RegisterActionResult> {
  return registerAction({
    characterId,
    actionType: 'GATHER_HERBS', // 採集行動を流用
    parameters: { skinning: true, monsterType },
    durationOverrideMinutes: 10,
  })
}

/** 剥ぎ取り完了時の処理 */
export async function completeSkinning(
  characterId: string,
  monsterType: MonsterType
): Promise<string> {
  const monster = MONSTERS[monsterType]
  if (!monster) return '剥ぎ取れませんでした。'

  const char = await sql<{ skillSkinningGrowth: number }[]>`
    SELECT skill_skinning_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const skill = char[0]?.skillSkinningGrowth ?? 0

  // スキルに応じて取得素材数が増える
  const baseAmount = 1
  const bonusAmount = Math.floor(skill / 100)
  const amount = baseAmount + bonusAmount

  // 素材をインベントリに追加
  for (const materialName of monster.dropMaterials) {
    const template = await sql<{ id: string }[]>`
      SELECT id FROM item_templates WHERE name = ${materialName} LIMIT 1
    `
    if (template[0]) {
      await sql`
        INSERT INTO items (owner_character_id, item_template_id, quantity)
        VALUES (${characterId}, ${template[0].id}, ${amount})
      `
    }
  }

  // 剥ぎ取りSkill_Growth蓄積
  await sql`
    UPDATE characters SET skill_skinning_growth = skill_skinning_growth + ${Math.floor(Math.random() * 3) + 1}
    WHERE id = ${characterId}
  `
  // 器用さ成長
  await sql`
    UPDATE characters SET dexterity_growth = dexterity_growth + 1 WHERE id = ${characterId}
  `

  if (skill < 50) return `${monster.name}から素材を剥ぎ取った。まだ慣れていないが、なんとか取れた。`
  if (skill < 200) return `${monster.name}から手際よく素材を剥ぎ取った。`
  return `${monster.name}から無駄なく素材を剥ぎ取った。良質な素材が取れた。`
}

/** 装備可能かチェック（隠しステータス） */
export async function canEquip(
  characterId: string,
  itemTemplateId: string
): Promise<{ canEquip: boolean; reason?: string }> {
  const char = await sql<{ strengthGrowth: number; dexterityGrowth: number }[]>`
    SELECT strength_growth, dexterity_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const item = await sql<{ requiredStrength: number; requiredDexterity: number; itemWeight: number; name: string }[]>`
    SELECT required_strength, required_dexterity, item_weight, name FROM item_templates WHERE id = ${itemTemplateId} LIMIT 1
  `

  if (!char[0] || !item[0]) return { canEquip: false, reason: 'データが見つかりません。' }

  if (char[0].strengthGrowth < item[0].requiredStrength) {
    return { canEquip: false, reason: `この装備には十分な筋力が必要だ。もっと重い装備を使って鍛えよう。` }
  }
  if (char[0].dexterityGrowth < item[0].requiredDexterity) {
    return { canEquip: false, reason: `この装備には十分な器用さが必要だ。剥ぎ取りや細かい作業で鍛えよう。` }
  }

  return { canEquip: true }
}

function generateVictoryText(skillGrowth: number, monsterName: string, countText: string): string {
  if (skillGrowth < 50) return `なんとか${countText}${monsterName}を倒した。体中が傷だらけだ。`
  if (skillGrowth < 200) return `${countText}${monsterName}を倒した。いい戦いだった。`
  if (skillGrowth < 500) return `${countText}${monsterName}を鮮やかに倒した。剣筋が冴えている。`
  return `${countText}${monsterName}を圧倒した。もはや敵ではない。`
}

function generateHnsMetadata() {
  const r = Math.random()
  let rarity = 'NORMAL'
  if (r < 0.005) rarity = 'LEGENDARY'       // 0.5%
  else if (r < 0.02) rarity = 'EPIC'        // 1.5%
  else if (r < 0.07) rarity = 'RARE'        // 5%
  else if (r < 0.20) rarity = 'MAGIC'       // 13%

  const prefixes = ['鋭い', '重い', '呪われた', '祝福された', '炎の', '氷の', '雷の', '猛毒の', '神聖な', '血塗られた']
  const suffixes = ['・改', '・真', '・極', '・絶', '・幻']

  let namePrefix = ''
  let nameSuffix = ''
  let bonusStr = 0
  let bonusDex = 0

  if (rarity !== 'NORMAL') {
    namePrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    bonusStr += Math.floor(Math.random() * 5) + 1
    bonusDex += Math.floor(Math.random() * 5) + 1
  }
  if (rarity === 'EPIC' || rarity === 'LEGENDARY') {
    nameSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    bonusStr += Math.floor(Math.random() * 10) + 5
    bonusDex += Math.floor(Math.random() * 10) + 5
  }

  return {
    rarity,
    prefix: namePrefix,
    suffix: nameSuffix,
    bonusStrength: bonusStr,
    bonusDexterity: bonusDex
  }
}
