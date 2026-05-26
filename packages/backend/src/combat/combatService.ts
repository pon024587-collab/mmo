/**
 * 戦闘・魔物システム
 * 群れ戦闘・剥ぎ取り・隠しステータス対応
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'
import { addSkillExp } from '../skills/skillService.js'

export type MonsterType =
  // Tier1 (弱)
  | 'SLIME' | 'BAT' | 'GIANT_RAT' | 'GOBLIN' | 'SKELETON' | 'ZOMBIE'
  | 'HOBGOBLIN' | 'KOBOLD' | 'WOLF' | 'POISON_SPIDER'
  // Tier2 (普通)
  | 'ORC' | 'BANDIT' | 'LIZARDMAN' | 'HARPY' | 'GIANT_SNAKE'
  | 'HELLHOUND' | 'GREMLIN' | 'MUMMY' | 'GOLEM' | 'ORC_WARRIOR'
  // Tier3 (強)
  | 'UNDEAD' | 'DARK_ELF' | 'TROLL' | 'GRIFFIN' | 'BASILISK'
  | 'VAMPIRE' | 'OGRE' | 'CHIMERA' | 'WEREWOLF' | 'GARGOYLE'
  | 'CYCLOPS' | 'ZOMBIE_KNIGHT' | 'DARK_MAGE' | 'STONE_GOLEM'
  | 'DOPPELGANGER' | 'DARK_KNIGHT'
  // Tier4 (超強)
  | 'PHOENIX' | 'LICH' | 'HYDRA' | 'MINOTAUR' | 'DRAGON'
  | 'GORGON' | 'WYVERN' | 'DEMON_MINION' | 'ABYSS_WALKER' | 'TITAN'
  // Tier5 (ボス)
  | 'ANCIENT_DRAGON' | 'DEMON_KING' | 'DEATH_GOD' | 'FALLEN_ANGEL' | 'CHAOS_GOD'

interface MonsterStats {
  name: string
  basePower: number
  dropMaterials: string[]
  dropItems: string[]
  minCount: number
  maxCount: number
}

const MONSTERS: Record<MonsterType, MonsterStats> = {
  // --- Tier1 (basePower 5-15) ---
  SLIME:        { name: 'スライム',       basePower: 5,   dropMaterials: ['スライムの核'],                       dropItems: [],         minCount: 1, maxCount: 3  },
  BAT:          { name: 'コウモリ',       basePower: 8,   dropMaterials: ['コウモリの翼'],                       dropItems: [],         minCount: 1, maxCount: 8  },
  GIANT_RAT:    { name: '大ネズミ',       basePower: 8,   dropMaterials: ['ネズミの毛皮'],                       dropItems: [],         minCount: 1, maxCount: 6  },
  GOBLIN:       { name: 'ゴブリン',       basePower: 10,  dropMaterials: ['ゴブリンの耳'],                       dropItems: ['鉄鉱石'], minCount: 1, maxCount: 5  },
  SKELETON:     { name: 'スケルトン',     basePower: 10,  dropMaterials: ['古びた骨'],                           dropItems: [],         minCount: 1, maxCount: 4  },
  ZOMBIE:       { name: 'ゾンビ',         basePower: 10,  dropMaterials: ['腐敗した肉'],                         dropItems: [],         minCount: 1, maxCount: 5  },
  HOBGOBLIN:    { name: 'ホブゴブリン',   basePower: 13,  dropMaterials: ['ゴブリンの耳', 'ホブゴブリンの牙'],   dropItems: [],         minCount: 1, maxCount: 3  },
  KOBOLD:       { name: 'コボルト',       basePower: 12,  dropMaterials: ['コボルトの鱗'],                       dropItems: [],         minCount: 1, maxCount: 5  },
  WOLF:         { name: '狼',             basePower: 15,  dropMaterials: ['狼の毛皮'],                           dropItems: ['肉'],     minCount: 1, maxCount: 6  },
  POISON_SPIDER:{ name: '毒蜘蛛',         basePower: 12,  dropMaterials: ['蜘蛛の糸', '毒の牙'],                 dropItems: [],         minCount: 1, maxCount: 4  },
  // --- Tier2 (basePower 16-35) ---
  ORC:          { name: 'オーク',         basePower: 25,  dropMaterials: ['オークの牙'],                         dropItems: ['肉'],     minCount: 1, maxCount: 3  },
  BANDIT:       { name: '盗賊',           basePower: 20,  dropMaterials: ['盗賊のナイフ'],                       dropItems: ['銅の剣'], minCount: 1, maxCount: 4  },
  LIZARDMAN:    { name: 'リザードマン',   basePower: 22,  dropMaterials: ['リザードの鱗'],                       dropItems: [],         minCount: 1, maxCount: 3  },
  HARPY:        { name: 'ハーピー',       basePower: 20,  dropMaterials: ['ハーピーの羽根'],                     dropItems: [],         minCount: 1, maxCount: 4  },
  GIANT_SNAKE:  { name: '大蛇',           basePower: 25,  dropMaterials: ['蛇の皮', '蛇の毒腺'],                 dropItems: [],         minCount: 1, maxCount: 2  },
  HELLHOUND:    { name: '魔犬',           basePower: 28,  dropMaterials: ['魔犬の牙'],                           dropItems: [],         minCount: 1, maxCount: 3  },
  GREMLIN:      { name: 'グレムリン',     basePower: 18,  dropMaterials: ['グレムリンの爪'],                     dropItems: [],         minCount: 2, maxCount: 6  },
  MUMMY:        { name: 'ミイラ',         basePower: 22,  dropMaterials: ['包帯布', '呪いの砂'],                 dropItems: [],         minCount: 1, maxCount: 3  },
  GOLEM:        { name: 'ゴーレム',       basePower: 35,  dropMaterials: ['魔法の石'],                           dropItems: ['石材'],   minCount: 1, maxCount: 1  },
  ORC_WARRIOR:  { name: 'オーク戦士',     basePower: 30,  dropMaterials: ['オークの牙', 'オークの角'],           dropItems: ['肉'],     minCount: 1, maxCount: 2  },
  // --- Tier3 (basePower 36-65) ---
  UNDEAD:       { name: 'アンデッド',     basePower: 30,  dropMaterials: ['アンデッドの骨'],                     dropItems: ['薬草'],   minCount: 2, maxCount: 8  },
  DARK_ELF:     { name: 'ダークエルフ',   basePower: 35,  dropMaterials: ['ダークエルフの弓'],                   dropItems: ['魔石'],   minCount: 1, maxCount: 3  },
  TROLL:        { name: 'トロル',         basePower: 40,  dropMaterials: ['トロルの皮'],                         dropItems: ['石材'],   minCount: 1, maxCount: 2  },
  GRIFFIN:      { name: 'グリフィン',     basePower: 45,  dropMaterials: ['グリフィンの羽根', 'グリフィンの爪'], dropItems: [],         minCount: 1, maxCount: 2  },
  BASILISK:     { name: 'バジリスク',     basePower: 48,  dropMaterials: ['バジリスクの石眼', '石化の体液'],     dropItems: [],         minCount: 1, maxCount: 1  },
  VAMPIRE:      { name: 'ヴァンパイア',   basePower: 50,  dropMaterials: ['ヴァンパイアの血', 'ヴァンパイアの牙'],dropItems: [],        minCount: 1, maxCount: 2  },
  OGRE:         { name: 'オーガ',         basePower: 45,  dropMaterials: ['オーガの角'],                         dropItems: ['石材'],   minCount: 1, maxCount: 2  },
  CHIMERA:      { name: 'キマイラ',       basePower: 55,  dropMaterials: ['キマイラの角', 'キマイラの爪'],       dropItems: [],         minCount: 1, maxCount: 1  },
  WEREWOLF:     { name: 'ウェアウルフ',   basePower: 48,  dropMaterials: ['銀の毛皮'],                           dropItems: [],         minCount: 1, maxCount: 2  },
  GARGOYLE:     { name: 'ガーゴイル',     basePower: 42,  dropMaterials: ['ガーゴイルの翼'],                     dropItems: ['石材'],   minCount: 1, maxCount: 3  },
  CYCLOPS:      { name: 'サイクロプス',   basePower: 50,  dropMaterials: ['サイクロプスの目'],                   dropItems: [],         minCount: 1, maxCount: 1  },
  ZOMBIE_KNIGHT:{ name: 'ゾンビナイト',   basePower: 40,  dropMaterials: ['錆びた鎧の破片', '死者の魂石'],       dropItems: [],         minCount: 1, maxCount: 2  },
  DARK_MAGE:    { name: '闇魔法使い',     basePower: 45,  dropMaterials: ['闇の魔石', '禁書の欠片'],             dropItems: [],         minCount: 1, maxCount: 2  },
  STONE_GOLEM:  { name: 'ストーンゴーレム',basePower: 55, dropMaterials: ['魔法の石', '古代石'],                 dropItems: ['石材'],   minCount: 1, maxCount: 1  },
  DOPPELGANGER: { name: 'ドッペルゲンガー',basePower: 52, dropMaterials: ['幻影の結晶'],                         dropItems: [],         minCount: 1, maxCount: 1  },
  DARK_KNIGHT:  { name: '暗黒騎士',       basePower: 60,  dropMaterials: ['暗黒の鎧片', '呪われた剣の欠片'],     dropItems: [],         minCount: 1, maxCount: 1  },
  // --- Tier4 (basePower 66-100) ---
  PHOENIX:      { name: 'フェニックス',   basePower: 70,  dropMaterials: ['不死鳥の羽根', '炎の心臓'],           dropItems: [],         minCount: 1, maxCount: 1  },
  LICH:         { name: 'リッチ',         basePower: 80,  dropMaterials: ['リッチの杖', '死の魔石'],             dropItems: [],         minCount: 1, maxCount: 1  },
  HYDRA:        { name: 'ヒュドラ',       basePower: 75,  dropMaterials: ['ヒュドラの頭', '再生の血'],           dropItems: [],         minCount: 1, maxCount: 1  },
  MINOTAUR:     { name: 'ミノタウロス',   basePower: 70,  dropMaterials: ['ミノタウロスの角', '迷宮の牛革'],     dropItems: [],         minCount: 1, maxCount: 1  },
  DRAGON:       { name: 'ドラゴン',       basePower: 100, dropMaterials: ['竜の鱗', '竜の血'],                   dropItems: ['竜の杖'], minCount: 1, maxCount: 1  },
  GORGON:       { name: 'ゴルゴン',       basePower: 72,  dropMaterials: ['ゴルゴンの蛇髪', '石化の瞳'],         dropItems: [],         minCount: 1, maxCount: 1  },
  WYVERN:       { name: 'ワイバーン',     basePower: 85,  dropMaterials: ['ワイバーンの翼', '竜の血'],           dropItems: [],         minCount: 1, maxCount: 1  },
  DEMON_MINION: { name: '魔王の手下',     basePower: 88,  dropMaterials: ['悪魔の角', '魔界の石'],               dropItems: [],         minCount: 1, maxCount: 1  },
  ABYSS_WALKER: { name: '深淵の歩者',     basePower: 90,  dropMaterials: ['深淵の結晶'],                         dropItems: [],         minCount: 1, maxCount: 1  },
  TITAN:        { name: 'タイタン',       basePower: 95,  dropMaterials: ['タイタンの骨', '巨人の心臓'],         dropItems: [],         minCount: 1, maxCount: 1  },
  // --- Tier5 (basePower 120+, ボス) ---
  ANCIENT_DRAGON:{ name: '古竜',          basePower: 150, dropMaterials: ['古竜の鱗', '古竜の心臓', '竜の血'],   dropItems: [],         minCount: 1, maxCount: 1  },
  DEMON_KING:   { name: '魔王',           basePower: 200, dropMaterials: ['魔王の核', '魔界の王冠'],             dropItems: [],         minCount: 1, maxCount: 1  },
  DEATH_GOD:    { name: '死神',           basePower: 180, dropMaterials: ['死者の魂石', '死の結晶'],             dropItems: [],         minCount: 1, maxCount: 1  },
  FALLEN_ANGEL: { name: '堕天使',         basePower: 170, dropMaterials: ['堕天使の翼', '聖なる羽根'],           dropItems: [],         minCount: 1, maxCount: 1  },
  CHAOS_GOD:    { name: '混沌の神',       basePower: 250, dropMaterials: ['混沌の欠片', '世界樹の欠片', '神の眼'],dropItems: [],        minCount: 1, maxCount: 1  },
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
  const char = await sql<{ skillCombatGrowth: number; health: number; healthMax: number; equippedWeaponId: string | null }[]>`
    SELECT skill_combat_growth, health, health_max, equipped_weapon_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { resultText: '戦闘結果を処理できませんでした。', victory: false, canSkin: false }

  const monster = MONSTERS[monsterType]!
  const skill = char[0].skillCombatGrowth
  const totalPower = monster.basePower * count

  // 武器ステータスと詳細スキルの取得
  let weaponAtk = 0
  let weaponMag = 0
  let weaponCategory = 'WEAPON_UNARMED'
  
  if (char[0].equippedWeaponId) {
    const w = await sql<{ weaponCategory: string | null; attackPower: number; magicPower: number }[]>`
      SELECT it.weapon_category, it.attack_power, it.magic_power 
      FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedWeaponId}
    `
    if (w[0]) {
      weaponCategory = w[0].weaponCategory || 'WEAPON_UNARMED'
      weaponAtk = w[0].attackPower || 0
      weaponMag = w[0].magicPower || 0
    }
  }

  // 武器スキル・魔法スキルの補正値を取得
  const skills = await sql<{ exp: number }[]>`
    SELECT exp FROM character_skills 
    WHERE character_id = ${characterId} AND (skill_category = ${weaponCategory} OR skill_category LIKE 'MAGIC_%')
  `
  let skillBonus = 0
  for (const s of skills) {
    skillBonus += Math.floor(Math.sqrt(s.exp)) // 経験値の平方根をボーナスに（神級10000EXP = +100パワー）
  }

  // 勝敗判定（基礎力 + 武器攻撃力/魔法力 + スキル補正）
  const playerPower = skill + weaponAtk + weaponMag + skillBonus + Math.random() * 30
  const monsterPower = totalPower + Math.random() * 10
  const victory = playerPower >= monsterPower * 0.5

  const countText = count > 1 ? `${count}体の` : ''
  const mName = `${countText}${monster.name}`
  let battleLog = `【戦闘開始】 ${mName} が現れた！\n`

  if (playerPower > monsterPower * 1.5) {
    battleLog += `▶ あなたの先制攻撃！ 圧倒的な力で一掃した！\n`
  } else {
    battleLog += `▶ あなたの攻撃！ ${weaponCategory !== 'WEAPON_UNARMED' ? '武器の鋭い一撃！' : '素手による強烈な打撃！'}\n`
    if (monsterPower > playerPower) {
      battleLog += `▶ ${monster.name}の反撃！ 強烈なダメージを受けた！\n`
    } else {
      battleLog += `▶ ${monster.name}の反撃！ しかしあなたは間一髪で回避した！\n`
    }
    battleLog += `▶ あなたの追撃！ 魔法と技が交差する！\n`
  }

  if (victory) {
    // 戦闘Skill_Growth蓄積
    const growthGain = Math.floor(totalPower / 8) + Math.floor(Math.random() * 3)
    await sql`
      UPDATE characters
      SET skill_combat_growth = skill_combat_growth + ${growthGain}
      WHERE id = ${characterId}
    `

    // 詳細スキルの成長（魔法と武器）
    const magicCategory = getMonsterMagicCategory(monsterType)
    await addSkillExp(characterId, magicCategory, growthGain)
    await addSkillExp(characterId, weaponCategory, growthGain)

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
          let meta: Record<string, unknown> = {}
          if (template[0].category === 'WEAPON' || template[0].category === 'ARMOR') {
            meta = generateHnsMetadata()
          }
          const metaJson = JSON.stringify(meta)
          await sql`
            INSERT INTO items (owner_character_id, item_template_id, quantity, metadata)
            VALUES (${characterId}, ${template[0].id}, 1, ${metaJson}::jsonb)
          `
          const metaObj = meta as any
          const fullName = metaObj.rarity && metaObj.rarity !== 'NORMAL'
            ? `${metaObj.prefix || ''}${dropName}${metaObj.suffix || ''}`
            : dropName
          dropMsg = ` 戦利品: ${fullName} を手に入れた！`
        }
      }
    }

    battleLog += `\n【戦闘終了】 ${generateVictoryText(skill, monster.name, countText)}${dropMsg}`
    return {
      resultText: battleLog,
      victory: true,
      canSkin: true, // 剥ぎ取り可能
    }
  } else {
    await sql`UPDATE characters SET health = 0, updated_at = NOW() WHERE id = ${characterId}`
    battleLog += `\n【戦闘敗北】 ${mName}との戦いに敗れた。意識が遠のいていく…`
    return {
      resultText: battleLog,
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

function getMonsterMagicCategory(m: MonsterType): string {
  const FIRE = 'MAGIC_FIRE'
  const WATER = 'MAGIC_WATER'
  const WIND = 'MAGIC_WIND'
  const EARTH = 'MAGIC_EARTH'
  const THUNDER = 'MAGIC_THUNDER'
  const ICE = 'MAGIC_ICE'
  const LIGHT = 'MAGIC_LIGHT'
  const DARK = 'MAGIC_DARK'
  const TIME = 'MAGIC_TIME'
  const LIFE = 'MAGIC_LIFE'

  const mapping: Record<MonsterType, string> = {
    SLIME: WATER, BAT: WIND, GIANT_RAT: EARTH, GOBLIN: EARTH, SKELETON: DARK, ZOMBIE: DARK,
    HOBGOBLIN: EARTH, KOBOLD: EARTH, WOLF: WIND, POISON_SPIDER: DARK,
    ORC: EARTH, BANDIT: DARK, LIZARDMAN: WATER, HARPY: WIND, GIANT_SNAKE: WATER,
    HELLHOUND: FIRE, GREMLIN: THUNDER, MUMMY: DARK, GOLEM: EARTH, ORC_WARRIOR: EARTH,
    UNDEAD: DARK, DARK_ELF: DARK, TROLL: EARTH, GRIFFIN: WIND, BASILISK: EARTH,
    VAMPIRE: DARK, OGRE: EARTH, CHIMERA: THUNDER, WEREWOLF: LIFE, GARGOYLE: EARTH,
    CYCLOPS: EARTH, ZOMBIE_KNIGHT: DARK, DARK_MAGE: DARK, STONE_GOLEM: EARTH,
    DOPPELGANGER: TIME, DARK_KNIGHT: DARK,
    PHOENIX: FIRE, LICH: DARK, HYDRA: WATER, MINOTAUR: EARTH, DRAGON: FIRE,
    GORGON: EARTH, WYVERN: WIND, DEMON_MINION: DARK, ABYSS_WALKER: TIME, TITAN: EARTH,
    ANCIENT_DRAGON: TIME, DEMON_KING: DARK, DEATH_GOD: DARK, FALLEN_ANGEL: LIGHT, CHAOS_GOD: TIME
  }
  return mapping[m] || 'MAGIC_LIFE'
}
