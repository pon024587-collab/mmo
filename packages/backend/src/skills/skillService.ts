import { sql } from '../db/client.js'

export const SKILL_RANKS = ['初級', '普通', '中級', '上級', '聖級', '神級'] as const

export function getSkillRank(exp: number): string {
  if (exp >= 10000) return '神級'
  if (exp >= 5000) return '聖級'
  if (exp >= 2000) return '上級'
  if (exp >= 500) return '中級'
  if (exp >= 100) return '普通'
  return '初級'
}

export const MAGIC_GENRES = [
  'MAGIC_FIRE', 'MAGIC_WATER', 'MAGIC_WIND', 'MAGIC_EARTH', 'MAGIC_THUNDER',
  'MAGIC_ICE', 'MAGIC_LIGHT', 'MAGIC_DARK', 'MAGIC_TIME', 'MAGIC_LIFE'
] as const

export const WEAPON_GENRES = [
  'WEAPON_SWORD', 'WEAPON_SPEAR', 'WEAPON_AXE', 'WEAPON_BOW', 
  'WEAPON_DAGGER', 'WEAPON_BLUNT', 'WEAPON_STAFF', 'WEAPON_UNARMED'
] as const

export async function addSkillExp(characterId: string, skillCategory: string, amount: number) {
  if (amount <= 0) return

  await sql`
    INSERT INTO character_skills (character_id, skill_category, exp)
    VALUES (${characterId}, ${skillCategory}, ${amount})
    ON CONFLICT (character_id, skill_category) 
    DO UPDATE SET exp = character_skills.exp + ${amount}, updated_at = NOW()
  `
}

export async function getCharacterSkills(characterId: string) {
  const rows = await sql<{ skillCategory: string; exp: number }[]>`
    SELECT skill_category, exp FROM character_skills WHERE character_id = ${characterId}
  `
  return rows.map(r => ({
    category: r.skillCategory,
    exp: r.exp,
    rank: getSkillRank(r.exp)
  }))
}
