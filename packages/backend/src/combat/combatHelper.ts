import { sql } from '../db/client.js'

export async function getPlayerCombatPower(characterId: string) {
  const char = await sql<{ level: number; fatigueInternal: number; healthMax: number; equippedWeaponId: string | null; equippedArmorId: string | null; equippedAccessoryId: string | null; physPenetration: number; magPenetration: number; critRate: number }[]>`
    SELECT level, fatigue_internal, health_max, equipped_weapon_id, equipped_armor_id, equipped_accessory_id, phys_penetration, mag_penetration, crit_rate FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { attack: 10, defense: 10, maxHp: 100, level: 1, physPen: 0, magPen: 0, crit: 0 }

  const fatigue = Math.max(0, Math.min(100, char[0].fatigueInternal))
  const fatigueMultiplier = 1.0 - (fatigue * 0.5 / 100)

  const baseSkill = char[0].level * 15 + Math.floor(Math.pow(char[0].level, 1.5) * 3)
  const skillAtk = Math.floor(baseSkill * fatigueMultiplier)

  const calculatedMaxHp = 100 + char[0].level * 15 + Math.floor(Math.pow(char[0].level, 1.5) * 2)
  const actualHealthMax = Math.max(char[0].healthMax, calculatedMaxHp)

  let weaponAtk = 0
  let atkPercent = 0
  let weaponCategory = 'WEAPON_UNARMED'

  if (char[0].equippedWeaponId) {
    const w = await sql<{ weaponCategory: string | null; attackPower: number; magicPower: number; metadata: any }[]>`
      SELECT it.weapon_category, it.attack_power, it.magic_power, i.metadata
      FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedWeaponId}
    `
    if (w[0]) {
      weaponCategory = w[0].weaponCategory || 'WEAPON_UNARMED'
      weaponAtk = (w[0].attackPower || 0) + (w[0].magicPower || 0)
      
      const crystals = w[0].metadata?.crystals || []
      for (const c of crystals) {
        if (c.ATK) weaponAtk += c.ATK
        if (c.MP) weaponAtk += c.MP
        if (c.ATK_PERCENT) atkPercent += c.ATK_PERCENT
      }
      
      const enhanceLv = w[0].metadata?.enhance || 0
      weaponAtk += Math.pow(enhanceLv, 2) * 20

      const substats = w[0].metadata?.substats || []
      for (const s of substats) {
        if (s.type === 'ATK' || s.type === 'MAG') weaponAtk += s.value
        if (s.type === 'CRIT') atkPercent += s.value
      }
    }
  }

  let defBonus = 0
  let defPercent = 0
  if (char[0].equippedArmorId) {
    const a = await sql<{ metadata: any }[]>`
      SELECT i.metadata FROM items i
      WHERE i.id = ${char[0].equippedArmorId}
    `
    if (a[0]) {
      const crystals = a[0].metadata?.crystals || []
      for (const c of crystals) {
        if (c.DEF) defBonus += c.DEF
        if (c.DEF_PERCENT) defPercent += c.DEF_PERCENT
      }
      const enhanceLv = a[0].metadata?.enhance || 0
      defBonus += Math.pow(enhanceLv, 2) * 10

      const substats = a[0].metadata?.substats || []
      for (const s of substats) {
        if (s.type === 'DEF') defBonus += s.value
        if (s.type === 'DEF_PERCENT') defPercent += s.value
      }
    }
  }

  const skills = await sql<{ exp: number }[]>`
    SELECT exp FROM character_skills
    WHERE character_id = ${characterId} AND (skill_category = ${weaponCategory} OR skill_category LIKE 'MAGIC_%')
  `
  let skillBonus = 0
  for (const s of skills) {
    skillBonus += Math.floor(Math.sqrt(s.exp))
  }

  weaponAtk = Math.floor(weaponAtk * fatigueMultiplier)
  skillBonus = Math.floor(skillBonus * fatigueMultiplier)

  const atkMultiplier = 1 + (atkPercent / 100)
  const defMultiplier = 1 + (defPercent / 100)

  const finalAttack = ((skillAtk + weaponAtk + skillBonus) * atkMultiplier)
  const finalDefense = (defBonus * 1.5 * defMultiplier)

  return { 
    attack: finalAttack, 
    defense: finalDefense, 
    maxHp: actualHealthMax, 
    level: char[0].level,
    physPen: char[0].physPenetration,
    magPen: char[0].magPenetration,
    crit: char[0].critRate
  }
}
