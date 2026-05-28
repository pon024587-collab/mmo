/**
 * 戦闘・魔物システム
 * 群れ戦闘・剥ぎ取り・隠しステータス対応
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'
import { addSkillExp } from '../skills/skillService.js'
import { giveItem } from '../character/itemService.js'

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

  // 強化種・超強化種の抽選（超強化種 1%、強化種 10%）
  const eliteRoll = Math.random()
  let eliteMultiplier = 1
  let eliteLabel = ''
  if (eliteRoll < 0.01) {
    eliteMultiplier = 4
    eliteLabel = 'SUPER_ELITE'
  } else if (eliteRoll < 0.11) {
    eliteMultiplier = 2
    eliteLabel = 'ELITE'
  }

  const totalPower = monster.basePower * count * eliteMultiplier

  // 戦闘所要時間（群れが多いほど長い）
  const durationMinutes = Math.max(3, Math.min(60, Math.floor(totalPower / 3)))

  return registerAction({
    characterId,
    actionType: 'COMBAT_MONSTER',
    parameters: { monsterType, count, eliteMultiplier, eliteLabel },
    durationOverrideMinutes: durationMinutes,
  })
}

/** 戦闘完了時の処理 */
export async function completeCombat(
  characterId: string,
  monsterType: MonsterType,
  count: number = 1,
  eliteMultiplier: number = 1,
  eliteLabel: string = ''
): Promise<{ resultText: string; victory: boolean; canSkin: boolean }> {
  const char = await sql<{ level: number; skillCombatGrowth: number; fatigueInternal: number; health: number; healthMax: number; equippedWeaponId: string | null; equippedArmorId: string | null; equippedAccessoryId: string | null; physPenetration: number; magPenetration: number; critRate: number }[]>`
    SELECT level, skill_combat_growth, fatigue_internal, health, health_max, equipped_weapon_id, equipped_armor_id, equipped_accessory_id, phys_penetration, mag_penetration, crit_rate FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { resultText: '戦闘結果を処理できませんでした。', victory: false, canSkin: false }

  const monster = MONSTERS[monsterType]!
  
  // 疲労ペナルティ（疲労100で全ステータスが半減）
  const fatigue = Math.max(0, Math.min(100, char[0].fatigueInternal))
  const fatigueMultiplier = 1.0 - (fatigue * 0.5 / 100)

  // 基礎戦闘力を後半ほど飛躍的に伸びるように変更 (二次関数的)
  // 例: Lv10=~244, Lv50=~1810, Lv100=~4500
  const baseSkill = char[0].level * 15 + Math.floor(Math.pow(char[0].level, 1.5) * 3)
  const skill = Math.floor(baseSkill * fatigueMultiplier)
  const totalPower = monster.basePower * count * eliteMultiplier

  // 実質最大HPの計算 (後半ほどHPが大きく伸びる)
  // 例: Lv10=~313, Lv50=~1557, Lv100=~3600
  const calculatedMaxHp = 100 + char[0].level * 15 + Math.floor(Math.pow(char[0].level, 1.5) * 2)
  const actualHealthMax = Math.max(char[0].healthMax, calculatedMaxHp)

  // 武器ステータスと属性情報の取得
  let weaponAtk = 0
  let weaponMag = 0
  let weaponCategory = 'WEAPON_UNARMED'
  let atkPercent = 0
  let defPercent = 0
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
        if (c.MP) weaponMag += c.MP
        if (c.ATK_PERCENT) atkPercent += c.ATK_PERCENT
      }
      
      // 強化値(enhance)ボーナス
      const enhanceLv = w[0].metadata?.enhance || 0
      const enhancePower = Math.pow(enhanceLv, 2) * 10
      weaponAtk += enhancePower
      weaponMag += enhancePower
      if (weaponElement) weaponElementValue += enhanceLv * 5

      // サブステータスボーナス
      const substats = w[0].metadata?.substats || []
      for (const s of substats) {
        if (s.type === 'ATK')   weaponAtk += s.value
        if (s.type === 'MAG')   weaponMag += s.value
        if (s.type === 'CRIT')  atkPercent += s.value
      }
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
        if (c.DEF_PERCENT) defPercent += c.DEF_PERCENT
        // 防具の属性耐性ボーナス
        if (c.FIRE_RES && armorElement === 'FIRE') armorElementValue += c.FIRE_RES
        if (c.WATER_RES && armorElement === 'WATER') armorElementValue += c.WATER_RES
      }
      
      // 防具強化ボーナス: (enhanceLv^2 * 10)
      const enhanceLv = a[0].metadata?.enhance || 0
      defBonus += Math.pow(enhanceLv, 2) * 10
      if (armorElement) armorElementValue += enhanceLv * 5

      // 防具サブステータスボーナス
      const armorSubstats = a[0].metadata?.substats || []
      for (const s of armorSubstats) {
        if (s.type === 'DEF') defBonus += s.value
        if (s.type === 'HP')  defBonus += Math.floor(s.value / 10)
        if (s.type === 'DEF_PERCENT') defPercent += s.value
      }
      
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
  // 武器の属性攻撃 or 装飾品の属性攻撃が魔物の属性と一致する場合ボーナス (パーセンテージ倍率)
  let elementalAtkMultiplier = 1.0
  let elementalAtkMsg = ''
  if (randomElement && weaponElement === randomElement) {
    elementalAtkMultiplier = 1.0 + (weaponElementValue / 100)
    elementalAtkMsg = `\n⚡ 属性一致！ 【${elementNames[randomElement]}弱点】を突き、攻撃力が ${Math.floor(elementalAtkMultiplier * 100)}% にアップ！`
  } else if (randomElement && accElement === randomElement) {
    elementalAtkMultiplier = 1.0 + (accElementValue / 100)
    elementalAtkMsg = `\n⚡ 属性一致！ 【${elementNames[randomElement]}弱点】を突き、攻撃力が ${Math.floor(elementalAtkMultiplier * 100)}% にアップ！`
  }

  // ===== 属性耐性ボーナス計算 =====
  // 防具 or 装飾品の属性耐性が魔物の属性と一致する場合、ダメージを割合で軽減 (最大80%カット)
  let elementalResMultiplier = 1.0
  let elementalResMsg = ''
  if (randomElement && armorElement === randomElement) {
    elementalResMultiplier = Math.max(0.2, 1.0 - (armorElementValue / 100))
    elementalResMsg = `\n🛡️ 防具の属性耐性が機能！ 【${elementNames[randomElement]}耐性】でダメージを ${Math.floor((1 - elementalResMultiplier) * 100)}% 軽減！`
  } else if (randomElement && accElement === randomElement && !elementalAtkMsg) {
    elementalResMultiplier = Math.max(0.2, 1.0 - (accElementValue / 100))
    elementalResMsg = `\n🛡️ 装飾品の属性耐性が機能！ 【${elementNames[randomElement]}耐性】でダメージを ${Math.floor((1 - elementalResMultiplier) * 100)}% 軽減！`
  }

  // ===== 新戦闘システム (ターンシミュレーション) =====
  const baseMonsterPower = monster.basePower * eliteMultiplier
  const monsterHp = baseMonsterPower * 10 * count
  const monsterPhysDef = Math.floor(baseMonsterPower * 1.5)
  const monsterMagDef = Math.floor(baseMonsterPower * 1.5)
  const monsterAtk = Math.floor(baseMonsterPower * 1.2 * count)

  const atkMultiplier = 1 + (atkPercent / 100)
  const defMultiplier = 1 + (defPercent / 100)

  // プレイヤー攻撃力
  const playerPhysAtk = (weaponAtk + skill + skillBonus) * atkMultiplier
  const playerMagAtk = (weaponMag + skill + skillBonus) * atkMultiplier
  const playerDef = defBonus * defMultiplier

  // 貫通計算
  const actualPhysDef = Math.max(0, monsterPhysDef - char[0].physPenetration)
  const actualMagDef = Math.max(0, monsterMagDef - char[0].magPenetration)

  let physDmg = playerPhysAtk - actualPhysDef
  let magDmg = playerMagAtk - actualMagDef
  // 武器を持たず素手の場合、最低でも少しはダメージが入るようにする
  if (physDmg < 1 && magDmg < 1) physDmg = 1

  let baseDmg = Math.max(1, physDmg) + Math.max(0, magDmg)
  baseDmg = baseDmg * elementalAtkMultiplier

  // クリティカル判定
  const isCrit = Math.random() < (char[0].critRate / 100)
  const finalPlayerDmgPerTurn = Math.floor(isCrit ? baseDmg * 1.5 : baseDmg)

  // 敵のダメージ
  let monsterDmgPerTurn = Math.max(1, monsterAtk - playerDef)
  monsterDmgPerTurn = Math.max(1, Math.floor(monsterDmgPerTurn * elementalResMultiplier))

  // シミュレーション
  const turnsToKill = Math.ceil(monsterHp / finalPlayerDmgPerTurn)
  let damageTaken = monsterDmgPerTurn * Math.max(0, turnsToKill - 1)
  
  // 乱数によるブレ (±10%)
  damageTaken = Math.floor(damageTaken * (0.9 + Math.random() * 0.2))

  const victory = char[0].health > damageTaken || turnsToKill <= 1

  const elStr = randomElement && elementNames[randomElement] ? `「${elementNames[randomElement]}属性」` : ''
  const countText = count > 1 ? `${count}体の` : ''
  const elitePrefix = eliteLabel === 'SUPER_ELITE' ? '⚡超強化種⚡ ' : eliteLabel === 'ELITE' ? '🔴強化種 ' : ''
  const mName = `${elitePrefix}${elStr}${countText}${monster.name}`
  let battleLog = `》戦闘開始《 ${mName}が現れた！`
  if (eliteLabel === 'SUPER_ELITE') battleLog += '\n⚡ 警告！この魔物は通常の４倍の強さを持つ超強化種だ！ドロップ率大幅アップ！'
  else if (eliteLabel === 'ELITE') battleLog += '\n🔴 この魔物は強化種！通常の２倍強い！その分素材が多く手に入る！'
  battleLog += '\n'

  let fatigueGained = 10

  if (turnsToKill <= 1) {
    battleLog += `▶ あなたの先制攻撃！ `
    if (isCrit) battleLog += `💥クリティカルヒット！ `
    battleLog += `${finalPlayerDmgPerTurn}のダメージを与え、圧倒的な力で一掃した！\n`
    fatigueGained = 5
    damageTaken = 0
  } else {
    battleLog += `▶ あなたの攻撃！ ${weaponCategory !== 'WEAPON_UNARMED' ? '武器の鋭い一撃！' : '素手による強烈な打撃！'}\n`
    if (elementalAtkMsg) battleLog += elementalAtkMsg + '\n'
    if (isCrit) battleLog += `💥 クリティカルヒット！\n`
    battleLog += `▶ ${mName}に毎ターン ${finalPlayerDmgPerTurn} のダメージを与えた！\n`

    if (elementalResMsg) battleLog += elementalResMsg + '\n'
    battleLog += `▶ ${mName}の激しい反撃！ ${turnsToKill - 1}ターンに渡り、合計 ${damageTaken} のダメージを受けた！\n`
    fatigueGained = 15 + Math.min(10, turnsToKill)
  }

  if (victory) {
    // ===== EXP効率計算 =====
    // 敵HPと自分の与ダメの比率で評価
    const ratio = finalPlayerDmgPerTurn / Math.max(monsterHp, 1)
    let expEfficiency: number
    let efficiencyMsg = ''

    if (ratio >= 4) {
      expEfficiency = 0
      efficiencyMsg = '\n⚠️ 弱すぎてスキルは全く鍛えられない。'
    } else if (ratio >= 2) {
      expEfficiency = 0.1
      efficiencyMsg = '\n💤 相手が弱すぎる。成長効率: 10%'
    } else if (ratio >= 1) {
      expEfficiency = 0.3
      efficiencyMsg = '\n💤 相手が弱い。成長効率: 30%'
    } else if (ratio >= 0.5) {
      expEfficiency = 0.6
      efficiencyMsg = '\n⚡ 少し物足りない相手。成長効率: 60%'
    } else if (ratio >= 0.2) {
      expEfficiency = 1.0
      efficiencyMsg = '\n⭐ 良い訓練相手。成長効率: 100%'
    } else {
      expEfficiency = 1.3
      efficiencyMsg = '\n🔥 危険な死闘だった！成長効率: 130%'
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

    // 自動で剥ぎ取りを実行（強化種は素材量僕アップ）
    const skinningResult = await completeSkinning(characterId, monsterType, eliteMultiplier)
    battleLog += `\n💀 剥ぎ取り: ${skinningResult}`

    return {
      resultText: battleLog,
      victory: true,
      canSkin: false, // 自動で実行したため不要
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
  monsterType: MonsterType,
  eliteMultiplier: number = 1
): Promise<string> {
  const monster = MONSTERS[monsterType]
  if (!monster) return '剥ぎ取れませんでした。'

  const char = await sql<{ skillSkinningGrowth: number }[]>`
    SELECT skill_skinning_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const skill = char[0]?.skillSkinningGrowth ?? 0

  // スキルに応じて取得素材数が増える（強化種は倍率分増加）
  const baseAmount = Math.ceil(eliteMultiplier)
  const bonusAmount = Math.floor(skill / 100)
  const amount = baseAmount + bonusAmount

  // 素材の決定
  const c1 = `${monster.name}の皮`
  const c2 = `${monster.name}の骨`
  const r1 = `${monster.name}の鋭牙`
  const ur1 = `${monster.name}の魔核`

  const drops: string[] = [c1, c2]
  const r = Math.random()
  // 強化種・超強化種はレアドロップ確率がeliteMultiplier倍
  const rareThreshold = 0.002 * eliteMultiplier   // 通常0.2% → 強化種0.4% → 超強化種0.8%
  const uncommonThreshold = 0.052 * eliteMultiplier // 通常5.2% → 強化種10.4% → 超強化種20.8%
  if (r < rareThreshold) {
    drops.push(ur1) // 激レア（強化種で確率UP）
  } else if (r < uncommonThreshold) {
    drops.push(r1) // レア（強化種で確率UP）
  }

  // 素材をインベントリに追加
  const droppedText = []
  for (const materialName of drops) {
    const template = await sql<{ id: string }[]>`
      SELECT id FROM item_templates WHERE name = ${materialName} LIMIT 1
    `
    if (template[0]) {
      await giveItem(characterId, template[0].id, amount, {})
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
