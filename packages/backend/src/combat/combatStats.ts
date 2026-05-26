/**
 * キャラクターの戦闘力を装備・スキル込みで算出するユーティリティ
 */
import { sql } from '../db/client.js'

export interface CombatStats {
  power: number          // 総合戦闘力
  weaponElement: string  // 装備武器の属性
  weaponElementValue: number
  armorElement: string   // 装備防具の属性耐性
  armorElementValue: number
  accAtkElement: string  // 装飾品の属性攻撃
  accAtkValue: number
  accResElement: string  // 装飾品の属性耐性
  accResValue: number
}

export async function calcCombatStats(characterId: string): Promise<CombatStats> {
  const char = await sql<{
    skillCombatGrowth: number
    equippedWeaponId: string | null
    equippedArmorId: string | null
    equippedAccessoryId: string | null
  }[]>`
    SELECT skill_combat_growth, equipped_weapon_id, equipped_armor_id, equipped_accessory_id
    FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { power: 0, weaponElement: '', weaponElementValue: 0, armorElement: '', armorElementValue: 0, accAtkElement: '', accAtkValue: 0, accResElement: '', accResValue: 0 }

  const skill = char[0].skillCombatGrowth
  let weaponAtk = 0, weaponMag = 0, weaponCategory = 'WEAPON_UNARMED'
  let weaponElement = '', weaponElementValue = 0
  let armorElement = '', armorElementValue = 0
  let accAtkElement = '', accAtkValue = 0
  let accResElement = '', accResValue = 0

  if (char[0].equippedWeaponId) {
    const w = await sql<{ weaponCategory: string | null; attackPower: number; magicPower: number; subParameters: any }[]>`
      SELECT it.weapon_category, it.attack_power, it.magic_power, it.properties
      FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedWeaponId}
    `
    if (w[0]) {
      weaponCategory = w[0].weaponCategory || 'WEAPON_UNARMED'
      weaponAtk = w[0].attackPower || 0
      weaponMag = w[0].magicPower || 0
      const sp = w[0].subParameters || {}
      weaponElement = sp.elementalAttack || ''
      weaponElementValue = sp.elementalAttackValue || 0
    }
  }

  if (char[0].equippedArmorId) {
    const a = await sql<{ subParameters: any }[]>`
      SELECT it.properties FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedArmorId}
    `
    if (a[0]) {
      const sp = a[0].subParameters || {}
      armorElement = sp.elementalResistance || ''
      armorElementValue = sp.elementalResistanceValue || 0
    }
  }

  if (char[0].equippedAccessoryId) {
    const ac = await sql<{ subParameters: any }[]>`
      SELECT it.properties FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedAccessoryId}
    `
    if (ac[0]) {
      const sp = ac[0].subParameters || {}
      accAtkElement = sp.elementalAttack || ''
      accAtkValue = sp.elementalAttackValue || 0
      accResElement = sp.elementalResistance || ''
      accResValue = sp.elementalResistanceValue || 0
    }
  }

  // スキルボーナス
  const skills = await sql<{ exp: number }[]>`
    SELECT exp FROM character_skills
    WHERE character_id = ${characterId} AND (skill_category = ${weaponCategory} OR skill_category LIKE 'MAGIC_%')
  `
  let skillBonus = 0
  for (const s of skills) skillBonus += Math.floor(Math.sqrt(s.exp))

  const power = skill + weaponAtk + weaponMag + skillBonus

  return { power, weaponElement, weaponElementValue, armorElement, armorElementValue, accAtkElement, accAtkValue, accResElement, accResValue }
}

/** 属性ボーナスを適用した最終攻撃力を返す */
export function applyElementalAtk(stats: CombatStats, targetElement: string): { finalPower: number; msg: string } {
  const elementNames: Record<string, string> = { FIRE: '炎', WATER: '水', WIND: '風', EARTH: '土', THUNDER: '雷', ICE: '氷', LIGHT: '光', DARK: '闇', POISON: '毒' }
  let bonus = 0, msg = ''
  if (targetElement && stats.weaponElement === targetElement) {
    bonus = stats.weaponElementValue
    msg = `⚡ 属性一致！【${elementNames[targetElement]}属性攻撃】が刺さり +${bonus}追加ダメージ！`
  } else if (targetElement && stats.accAtkElement === targetElement) {
    bonus = stats.accAtkValue
    msg = `⚡ 装飾品の属性が刺さった！【${elementNames[targetElement]}属性攻撃】+${bonus}追加ダメージ！`
  }
  return { finalPower: stats.power + bonus, msg }
}

/** 属性耐性でダメージを軽減して返す */
export function applyElementalRes(stats: CombatStats, attackerElement: string, rawDamage: number): { finalDamage: number; msg: string } {
  const elementNames: Record<string, string> = { FIRE: '炎', WATER: '水', WIND: '風', EARTH: '土', THUNDER: '雷', ICE: '氷', LIGHT: '光', DARK: '闇', POISON: '毒' }
  let resVal = 0, msg = ''
  if (attackerElement && stats.armorElement === attackerElement) {
    resVal = stats.armorElementValue
    msg = `🛡️ 防具の属性耐性が機能！【${elementNames[attackerElement]}耐性】でダメージ ${resVal} 軽減！`
  } else if (attackerElement && stats.accResElement === attackerElement) {
    resVal = stats.accResValue
    msg = `🛡️ 装飾品の属性耐性が機能！【${elementNames[attackerElement]}耐性】でダメージ ${resVal} 軽減！`
  }
  return { finalDamage: Math.max(0, rawDamage - resVal), msg }
}
