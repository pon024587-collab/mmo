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
  elements: string[]
  terrains: string[]
  minCount: number
  maxCount: number
}

export const MONSTERS: Record<MonsterType, MonsterStats> = {
  // --- Tier1 (basePower 5-15) ---
  SLIME:        { name: 'スライム',       basePower: 5,   elements: ['WATER','ICE'], terrains: ['RIVER','FOREST','PLAIN'], minCount: 1, maxCount: 3 },
  BAT:          { name: 'コウモリ',       basePower: 8,   elements: ['WIND','DARK'], terrains: ['MOUNTAIN','FOREST'], minCount: 1, maxCount: 8 },
  GIANT_RAT:    { name: '大ネズミ',       basePower: 8,   elements: ['EARTH','DARK'], terrains: ['PLAIN','FOREST','DESERT'], minCount: 1, maxCount: 6 },
  GOBLIN:       { name: 'ゴブリン',       basePower: 10,  elements: ['EARTH','FIRE'], terrains: ['FOREST','MOUNTAIN'], minCount: 1, maxCount: 5 },
  SKELETON:     { name: 'スケルトン',     basePower: 10,  elements: ['DARK','EARTH'], terrains: ['SNOWFIELD','DESERT'], minCount: 1, maxCount: 4 },
  ZOMBIE:       { name: 'ゾンビ',         basePower: 10,  elements: ['DARK','WATER'], terrains: ['FOREST','RIVER'], minCount: 1, maxCount: 5 },
  HOBGOBLIN:    { name: 'ホブゴブリン',   basePower: 13,  elements: ['EARTH','FIRE','THUNDER'], terrains: ['FOREST','MOUNTAIN'], minCount: 1, maxCount: 3 },
  KOBOLD:       { name: 'コボルト',       basePower: 12,  elements: ['EARTH','WIND'], terrains: ['MOUNTAIN','PLAIN'], minCount: 1, maxCount: 5 },
  WOLF:         { name: '狼',             basePower: 15,  elements: ['WIND','ICE'], terrains: ['SNOWFIELD','FOREST','PLAIN'], minCount: 1, maxCount: 6 },
  POISON_SPIDER:{ name: '毒蜘蛛',         basePower: 12,  elements: ['DARK','EARTH'], terrains: ['FOREST','MOUNTAIN'], minCount: 1, maxCount: 4 },
  
  // --- Tier2 (basePower 16-35) ---
  ORC:          { name: 'オーク',         basePower: 25,  elements: ['EARTH','FIRE'], terrains: ['MOUNTAIN','PLAIN'], minCount: 1, maxCount: 3 },
  BANDIT:       { name: '盗賊',           basePower: 20,  elements: ['DARK','EARTH'], terrains: ['FOREST','DESERT','PLAIN'], minCount: 1, maxCount: 4 },
  LIZARDMAN:    { name: 'リザードマン',   basePower: 22,  elements: ['WATER','EARTH'], terrains: ['RIVER','PLAIN'], minCount: 1, maxCount: 3 },
  HARPY:        { name: 'ハーピー',       basePower: 20,  elements: ['WIND','THUNDER'], terrains: ['MOUNTAIN','PLAIN'], minCount: 1, maxCount: 4 },
  GIANT_SNAKE:  { name: '大蛇',           basePower: 25,  elements: ['WATER','DARK'], terrains: ['FOREST','RIVER'], minCount: 1, maxCount: 2 },
  HELLHOUND:    { name: '魔犬',           basePower: 28,  elements: ['FIRE','DARK'], terrains: ['MOUNTAIN','DESERT'], minCount: 1, maxCount: 3 },
  GREMLIN:      { name: 'グレムリン',     basePower: 18,  elements: ['THUNDER','WIND'], terrains: ['MOUNTAIN','DESERT'], minCount: 2, maxCount: 6 },
  MUMMY:        { name: 'ミイラ',         basePower: 22,  elements: ['DARK','EARTH','FIRE'], terrains: ['DESERT'], minCount: 1, maxCount: 3 },
  GOLEM:        { name: 'ゴーレム',       basePower: 35,  elements: ['EARTH'], terrains: ['MOUNTAIN'], minCount: 1, maxCount: 1 },
  ORC_WARRIOR:  { name: 'オーク戦士',     basePower: 30,  elements: ['EARTH','FIRE'], terrains: ['MOUNTAIN','PLAIN'], minCount: 1, maxCount: 2 },

  // --- Tier3 中盤（×5強化: basePower 150-300） ---
  UNDEAD:       { name: 'アンデッド',     basePower: 150,  elements: ['DARK','ICE'], terrains: ['SNOWFIELD','FOREST'], minCount: 2, maxCount: 8 },
  DARK_ELF:     { name: 'ダークエルフ',   basePower: 175,  elements: ['DARK','WIND','ICE'], terrains: ['FOREST','SNOWFIELD'], minCount: 1, maxCount: 3 },
  TROLL:        { name: 'トロル',         basePower: 200,  elements: ['EARTH','WATER'], terrains: ['MOUNTAIN','RIVER'], minCount: 1, maxCount: 2 },
  GRIFFIN:      { name: 'グリフィン',     basePower: 225,  elements: ['WIND','THUNDER','LIGHT'], terrains: ['MOUNTAIN','PLAIN'], minCount: 1, maxCount: 2 },
  BASILISK:     { name: 'バジリスク',     basePower: 240,  elements: ['EARTH','POISON','DARK'], terrains: ['DESERT','MOUNTAIN'], minCount: 1, maxCount: 1 },
  VAMPIRE:      { name: 'ヴァンパイア',   basePower: 250,  elements: ['DARK','ICE','WIND'], terrains: ['FOREST','SNOWFIELD'], minCount: 1, maxCount: 2 },
  OGRE:         { name: 'オーガ',         basePower: 225,  elements: ['EARTH','FIRE'], terrains: ['MOUNTAIN','DESERT'], minCount: 1, maxCount: 2 },
  CHIMERA:      { name: 'キマイラ',       basePower: 275,  elements: ['THUNDER','FIRE'], terrains: ['MOUNTAIN'], minCount: 1, maxCount: 1 },
  WEREWOLF:     { name: 'ウェアウルフ',   basePower: 240,  elements: ['WIND','DARK','ICE'], terrains: ['FOREST','SNOWFIELD'], minCount: 1, maxCount: 2 },
  GARGOYLE:     { name: 'ガーゴイル',     basePower: 210,  elements: ['EARTH','WIND'], terrains: ['MOUNTAIN'], minCount: 1, maxCount: 3 },
  CYCLOPS:      { name: 'サイクロプス',   basePower: 250,  elements: ['EARTH','THUNDER'], terrains: ['MOUNTAIN','DESERT'], minCount: 1, maxCount: 1 },
  ZOMBIE_KNIGHT:{ name: 'ゾンビナイト',   basePower: 200,  elements: ['DARK','ICE'], terrains: ['SNOWFIELD','DESERT'], minCount: 1, maxCount: 2 },
  DARK_MAGE:    { name: '闇魔法使い',     basePower: 225,  elements: ['DARK','FIRE','ICE'], terrains: ['FOREST','DESERT'], minCount: 1, maxCount: 2 },
  STONE_GOLEM:  { name: 'ストーンゴーレム',basePower: 275, elements: ['EARTH'], terrains: ['MOUNTAIN'], minCount: 1, maxCount: 1 },
  DOPPELGANGER: { name: 'ドッペルゲンガー',basePower: 260, elements: ['DARK','LIGHT'], terrains: ['PLAIN','FOREST'], minCount: 1, maxCount: 1 },
  DARK_KNIGHT:  { name: '暗黒騎士',       basePower: 300,  elements: ['DARK','FIRE','ICE'], terrains: ['MOUNTAIN','SNOWFIELD'], minCount: 1, maxCount: 1 },

  // --- Tier4 後半（×12強化: basePower 850-1200） ---
  PHOENIX:      { name: 'フェニックス',   basePower: 850,  elements: ['FIRE','LIGHT'], terrains: ['MOUNTAIN','DESERT'], minCount: 1, maxCount: 2 },
  LICH:         { name: 'リッチ',         basePower: 960,  elements: ['DARK','ICE','EARTH'], terrains: ['SNOWFIELD','DESERT'], minCount: 1, maxCount: 2 },
  HYDRA:        { name: 'ヒュドラ',       basePower: 900,  elements: ['WATER','DARK','POISON'], terrains: ['RIVER'], minCount: 1, maxCount: 2 },
  MINOTAUR:     { name: 'ミノタウロス',   basePower: 850,  elements: ['EARTH','FIRE'], terrains: ['MOUNTAIN'], minCount: 1, maxCount: 3 },
  DRAGON:       { name: 'ドラゴン',       basePower: 1200, elements: ['FIRE','WIND','EARTH'], terrains: ['MOUNTAIN','DESERT'], minCount: 1, maxCount: 2 },
  GORGON:       { name: 'ゴルゴン',       basePower: 870,  elements: ['EARTH','DARK','WATER'], terrains: ['RIVER','MOUNTAIN'], minCount: 1, maxCount: 2 },
  WYVERN:       { name: 'ワイバーン',     basePower: 1020, elements: ['WIND','THUNDER'], terrains: ['MOUNTAIN','PLAIN'], minCount: 1, maxCount: 3 },
  DEMON_MINION: { name: '魔王の手下',     basePower: 1050, elements: ['DARK','FIRE'], terrains: ['MOUNTAIN','SNOWFIELD','DESERT'], minCount: 2, maxCount: 4 },
  ABYSS_WALKER: { name: '深淵の歩者',     basePower: 1080, elements: ['DARK','ICE','WATER'], terrains: ['SNOWFIELD','RIVER'], minCount: 1, maxCount: 2 },
  TITAN:        { name: 'タイタン',       basePower: 1140, elements: ['EARTH','THUNDER'], terrains: ['MOUNTAIN'], minCount: 1, maxCount: 2 },

  // --- Tier5 ボス（×25強化: basePower 3750-6250） ---
  ANCIENT_DRAGON:{ name: '古竜',          basePower: 3750, elements: ['LIGHT','DARK','FIRE'], terrains: ['MOUNTAIN'], minCount: 1, maxCount: 2 },
  DEMON_KING:   { name: '魔王',           basePower: 5000, elements: ['DARK','FIRE','ICE'], terrains: ['DESERT','MOUNTAIN'], minCount: 1, maxCount: 1 },
  DEATH_GOD:    { name: '死神',           basePower: 4500, elements: ['DARK','ICE'], terrains: ['SNOWFIELD'], minCount: 1, maxCount: 1 },
  FALLEN_ANGEL: { name: '堕天使',         basePower: 4250, elements: ['LIGHT','DARK','WIND'], terrains: ['MOUNTAIN','PLAIN'], minCount: 1, maxCount: 2 },
  CHAOS_GOD:    { name: '混沌の神',       basePower: 6250, elements: ['DARK','LIGHT','FIRE'], terrains: ['MOUNTAIN','DESERT','SNOWFIELD'], minCount: 1, maxCount: 1 },
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
  const char = await sql<{ level: number; skillCombatGrowth: number; fatigueInternal: number; health: number; healthMax: number; equippedWeaponId: string | null; equippedArmorId: string | null; equippedAccessoryId: string | null }[]>`
    SELECT level, skill_combat_growth, fatigue_internal, health, health_max, equipped_weapon_id, equipped_armor_id, equipped_accessory_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { resultText: '戦闘結果を処理できませんでした。', victory: false, canSkin: false }

  const monster = MONSTERS[monsterType]!
  // 基礎戦闘力を後半ほど飛躍的に伸びるように変更 (二次関数的)
  // 例: Lv10=~244, Lv50=~1810, Lv100=~4500
  const baseSkill = char[0].level * 15 + Math.floor(Math.pow(char[0].level, 1.5) * 3)
  const skill = Math.floor(baseSkill * fatigueMultiplier)
  const totalPower = monster.basePower * count

  // 実質最大HPの計算 (後半ほどHPが大きく伸びる)
  // 例: Lv10=~313, Lv50=~1557, Lv100=~3600
  const calculatedMaxHp = 100 + char[0].level * 15 + Math.floor(Math.pow(char[0].level, 1.5) * 2)
  const actualHealthMax = Math.max(char[0].healthMax, calculatedMaxHp)

  // 武器ステータスと属性情報の取得
  let weaponAtk = 0
  let weaponMag = 0
  let weaponCategory = 'WEAPON_UNARMED'
  let weaponElement = ''
  let weaponElementValue = 0

  if (char[0].equippedWeaponId) {
    const w = await sql<{ weaponCategory: string | null; attackPower: number; magicPower: number; properties: any; metadata: any }[]>`
      SELECT it.weapon_category, it.attack_power, it.magic_power, it.properties, i.metadata
      FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedWeaponId}
    `
    if (w[0]) {
      weaponCategory = w[0].weaponCategory || 'WEAPON_UNARMED'
      weaponAtk = w[0].attackPower || 0
      weaponMag = w[0].magicPower || 0
      const sp = w[0].properties || {}
      weaponElement = sp.elementalAttack || ''
      weaponElementValue = sp.elementalAttackValue || 0

      // クリスタルボーナス
      const crystals = w[0].metadata?.crystals || []
      for (const c of crystals) {
        if (c.ATK) weaponAtk += c.ATK
        if (c.MP) weaponMag += c.MP // 簡単のためMPボーナスを魔法力と見なす
      }
      
      // 強化値(enhance)ボーナス: 後半ほど強力になる二次関数 (enhanceLv^2 * 10)
      // 例: +1=+10, +5=+250, +9=+810
      const enhanceLv = w[0].metadata?.enhance || 0
      const enhancePower = Math.pow(enhanceLv, 2) * 10
      weaponAtk += enhancePower
      weaponMag += enhancePower
    }
  }

  // 防具・装飾品の属性耐性取得
  let armorElement = ''
  let armorElementValue = 0
  let accElement = ''
  let accElementValue = 0
  let defBonus = 0

  if (char[0].equippedArmorId) {
    const a = await sql<{ properties: any; metadata: any }[]>`
      SELECT it.properties, i.metadata FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedArmorId}
    `
    if (a[0]) {
      const sp = a[0].properties || {}
      armorElement = sp.elementalResistance || ''
      armorElementValue = sp.elementalResistanceValue || 0
      
      const crystals = a[0].metadata?.crystals || []
      for (const c of crystals) {
        if (c.DEF) defBonus += c.DEF
        // 防具の属性耐性ボーナス
        if (c.FIRE_RES && armorElement === 'FIRE') armorElementValue += c.FIRE_RES
        if (c.WATER_RES && armorElement === 'WATER') armorElementValue += c.WATER_RES
      }
      
      // 防具強化ボーナス: (enhanceLv^2 * 10)
      const enhanceLv = a[0].metadata?.enhance || 0
      defBonus += Math.pow(enhanceLv, 2) * 10
      
      // defBonusをグローバルに持たせるため、charのプロパティのように扱うか
      // 変数宣言を外に出す必要がある。
      // 一旦、ここで計算した defBonus を playerPower に加算できるように外部スコープの変数に渡す
    }
  }
  if (char[0].equippedAccessoryId) {
    const ac = await sql<{ properties: any }[]>`
      SELECT it.properties FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedAccessoryId}
    `
    if (ac[0]) {
      const sp = ac[0].properties || {}
      accElement = sp.elementalResistance || ''
      accElementValue = sp.elementalResistanceValue || 0
    }
  }

  // 武器スキル・魔法スキルの補正値を取得（疲労で刻吹）
  const skills = await sql<{ exp: number }[]>`
    SELECT exp FROM character_skills
    WHERE character_id = ${characterId} AND (skill_category = ${weaponCategory} OR skill_category LIKE 'MAGIC_%')
  `
  let skillBonus = 0
  for (const s of skills) {
    skillBonus += Math.floor(Math.sqrt(s.exp))
  }
  // 疲労による全ステータス減少
  weaponAtk = Math.floor(weaponAtk * fatigueMultiplier)
  weaponMag = Math.floor(weaponMag * fatigueMultiplier)
  weaponElementValue = Math.floor(weaponElementValue * fatigueMultiplier)
  armorElementValue = Math.floor(armorElementValue * fatigueMultiplier)
  accElementValue = Math.floor(accElementValue * fatigueMultiplier)
  skillBonus = Math.floor(skillBonus * fatigueMultiplier)

  // 魔物の出現時属性をランダム決定
  const randomElement = monster.elements[Math.floor(Math.random() * monster.elements.length)] || ''
  const elementNames: Record<string, string> = { FIRE: '炎', WATER: '水', WIND: '風', EARTH: '土', THUNDER: '雷', ICE: '氷', LIGHT: '光', DARK: '闇', POISON: '毒' }

  // ===== 属性攻撃ボーナス計算 =====
  // 武器の属性攻撃 or 装飾品の属性攻撃が魔物の属性と一致する場合ボーナス
  let elementalAtkBonus = 0
  let elementalAtkMsg = ''
  if (randomElement && weaponElement === randomElement) {
    elementalAtkBonus = weaponElementValue
    elementalAtkMsg = `\n⚡ 属性一致！ 【${elementNames[randomElement]}属性攻撃】が刺さり +${elementalAtkBonus}の追加ダメージ！`
  } else if (randomElement && accElement === randomElement) {
    elementalAtkBonus = accElementValue
    elementalAtkMsg = `\n⚡ 装飾品の属性が刺さった！ 【${elementNames[randomElement]}属性攻撃】+${elementalAtkBonus}の追加ダメージ！`
  }

  // ===== 属性耐性ボーナス計算 =====
  // 防具 or 装飾品の属性耐性が魔物の属性と一致する場合、ダメージ軽減
  let elementalResVal = 0
  let elementalResMsg = ''
  if (randomElement && armorElement === randomElement) {
    elementalResVal = armorElementValue
    elementalResMsg = `\n🛡️ 防具の属性耐性が機能！ 【${elementNames[randomElement]}耐性】でダメージ ${elementalResVal} 軽減！`
  } else if (randomElement && accElement === randomElement && !elementalAtkMsg) {
    // 装飾品は攻撃優先。耐性として使われるのは攻撃一致しない場合のみ
    elementalResVal = accElementValue
    elementalResMsg = `\n🛡️ 装飾品の属性耐性が機能！ 【${elementNames[randomElement]}耐性】でダメージ ${elementalResVal} 軽減！`
  }

  // 勝敗判定（基礎力 + 武器攻撃力/魔法力 + 防御力ボーナス + スキル補正 + 属性ボーナス）
  // 防御力がダメージ軽減に大きく寄与するよう、playerPowerへの加算倍率を高める
  const playerPower = skill + weaponAtk + weaponMag + (defBonus * 1.5) + skillBonus + elementalAtkBonus + Math.random() * 30
  const monsterPower = totalPower + Math.random() * 10
  const victory = playerPower >= monsterPower * 0.5
  const elStr = randomElement && elementNames[randomElement] ? `【${elementNames[randomElement]}属性】` : ''
  const countText = count > 1 ? `${count}体の` : ''
  const mName = `${elStr}${countText}${monster.name}`
  let battleLog = `【戦闘開始】 ${mName} が現れた！\n`

  let damageTaken = 0
  let fatigueGained = 10

  if (playerPower > monsterPower * 1.5) {
    battleLog += `▶ あなたの先制攻撃！ 圧倒的な力で一掃した！\n`
    fatigueGained = 5
  } else {
    battleLog += `▶ あなたの攻撃！ ${weaponCategory !== 'WEAPON_UNARMED' ? '武器の鋭い一撃！' : '素手による強烈な打撃！'}\n`
    if (elementalAtkMsg) battleLog += elementalAtkMsg + '\n'
    if (monsterPower > playerPower * 0.7) {
      // 敵が強い場合はダメージ計算 (防御力も加味して係数0.8)
      let rawDamage = Math.floor(monsterPower - (playerPower * 0.8))
      if (rawDamage < 1) rawDamage = 1
      // 属性耐性でダメージ軽減
      damageTaken = Math.max(0, rawDamage - (elementalResVal * 5)) // 耐性の効果を5倍に
      if (elementalResMsg) battleLog += elementalResMsg + '\n'
      battleLog += `▶ ${monster.name}の反撃！ ${damageTaken}のダメージを受けた！\n`
      fatigueGained = 20
    } else {
      battleLog += `▶ ${monster.name}の反撃！ しかしあなたは間一髪で回避した！\n`
      fatigueGained = 15
    }
    battleLog += `▶ あなたの追撃！ 魔法と技が交差する！\n`
  }

  if (victory) {
    // ===== EXP効率計算（強すぎると弱い敵からは成長しない）=====
    const ratio = playerPower / Math.max(monsterPower, 1)
    let expEfficiency: number
    let efficiencyMsg = ''

    if (ratio >= 4) {
      expEfficiency = 0
      efficiencyMsg = '\n⚠️ 弱すぎてスキルは全く鍛えられない。'
    } else if (ratio >= 3) {
      expEfficiency = 0.1
      efficiencyMsg = '\n💤 相手が弱すぎる。成長効率: 10%'
    } else if (ratio >= 2) {
      expEfficiency = 0.3
      efficiencyMsg = '\n💤 相手が弱い。成長効率: 30%'
    } else if (ratio >= 1.5) {
      expEfficiency = 0.6
      efficiencyMsg = '\n⚡ 少し物足りない相手。成長効率: 60%'
    } else if (ratio >= 1.0) {
      expEfficiency = 1.0
      efficiencyMsg = '\n⭐ 良い訓練相手。成長効率: 100%'
    } else {
      expEfficiency = 1.3
      efficiencyMsg = '\n🔥 危険な相手で負けにくい！成長効率: 130%'
    }
    battleLog += efficiencyMsg

    const baseGrowth = Math.floor(totalPower / 25) + Math.floor(Math.random() * 2)
    const growthGain = Math.max(0, Math.round(baseGrowth * expEfficiency))

    // 勝利時のステータス更新（ダメージと疲労、基礎戦闘スキル）
    await sql`
      UPDATE characters
      SET 
        health = GREATEST(1, health - ${damageTaken}), 
        fatigue_internal = LEAST(100, fatigue_internal + ${fatigueGained}),
        skill_combat_growth = skill_combat_growth + ${growthGain}
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

    // レベルアップ判定（累計growthが閾値を超えたら自動レベルアップ）
    // level N+1に必要な累計growth = N * N * 30
    const charLevel = await sql<{ level: number; skillCombatGrowth: number; healthMax: number }[]>`
      SELECT level, skill_combat_growth, health_max FROM characters WHERE id = ${characterId} LIMIT 1
    `
    if (charLevel[0]) {
      const { level: lv, skillCombatGrowth: totalGrowth, healthMax } = charLevel[0]
      const nextLvThreshold = lv * lv * 30
      if (totalGrowth >= nextLvThreshold && lv < 100) {
        // レベルアップ時に最大HPも増加し、現在HPも全回復
        const nextLevel = lv + 1
        const newMaxHp = 100 + nextLevel * 15 + Math.floor(Math.pow(nextLevel, 1.5) * 2)
        const newMax = Math.max(healthMax + 20, newMaxHp)
        await sql`
          UPDATE characters
          SET level = level + 1, health_max = ${newMax}, health = ${newMax}, updated_at = NOW()
          WHERE id = ${characterId}
        `
        battleLog += `\n🌟 レベルアップ！ レベルが ${nextLevel} になり、最大体力が ${newMax} に増加した！`
      }
    }

    battleLog += `\n【戦闘終了】 ${generateVictoryText(skill, monster.name, countText)}`
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

  // 素材の決定
  const c1 = `${monster.name}の皮`
  const c2 = `${monster.name}の骨`
  const r1 = `${monster.name}の鋭牙`
  const ur1 = `${monster.name}の魔核`

  const drops: string[] = [c1, c2]
  const r = Math.random()
  if (r < 0.002) {
    drops.push(ur1) // 激レア 0.2%
  } else if (r < 0.052) {
    drops.push(r1) // レア 5%
  }

  // 素材をインベントリに追加
  const droppedText = []
  for (const materialName of drops) {
    const template = await sql<{ id: string }[]>`
      SELECT id FROM item_templates WHERE name = ${materialName} LIMIT 1
    `
    if (template[0]) {
      await sql`
        INSERT INTO items (owner_character_id, item_template_id, quantity)
        VALUES (${characterId}, ${template[0].id}, ${amount})
      `
      droppedText.push(`${materialName}x${amount}`)
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

  const lootMsg = droppedText.length > 0 ? ` 獲得: ${droppedText.join(', ')}` : ''
  if (skill < 50) return `${monster.name}から素材を剥ぎ取った。まだ慣れていないが、なんとか取れた。${lootMsg}`
  if (skill < 200) return `${monster.name}から手際よく素材を剥ぎ取った。${lootMsg}`
  return `${monster.name}から無駄なく素材を剥ぎ取った。良質な素材が取れた。${lootMsg}`
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
