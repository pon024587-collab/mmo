/**
 * ギルド・組合システム
 */
import { sql } from '../db/client.js'

export type GuildType = 'ADVENTURER' | 'FARMER' | 'MERCHANT' | 'MAGE'

/** ギルドに加入申請する */
export async function joinGuild(
  characterId: string,
  guildId: string
): Promise<{ success: boolean; message?: string }> {
  const guild = await sql<{ id: string; guildType: GuildType; joinConditions: Record<string, number> }[]>`
    SELECT id, guild_type, join_conditions FROM guilds WHERE id = ${guildId} LIMIT 1
  `
  if (!guild[0]) return { success: false, message: 'ギルドが見つかりません。' }

  // 既に加入済みか確認
  const existing = await sql<{ guildId: string }[]>`
    SELECT guild_id FROM guild_memberships
    WHERE guild_id = ${guildId} AND character_id = ${characterId} LIMIT 1
  `
  if (existing[0]) return { success: false, message: 'すでにこのギルドに加入しています。' }

  // 加入条件確認
  const char = await sql<{
    skillCombatGrowth: number
    skillFarmingGrowth: number
    skillTradingGrowth: number
    skillMagicGrowth: number
  }[]>`
    SELECT skill_combat_growth, skill_farming_growth, skill_trading_growth, skill_magic_growth
    FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, message: 'キャラクターが見つかりません。' }

  const conditions = guild[0].joinConditions
  const skillMap: Record<string, number> = {
    combat: char[0].skillCombatGrowth,
    farming: char[0].skillFarmingGrowth,
    trading: char[0].skillTradingGrowth,
    magic: char[0].skillMagicGrowth,
  }

  for (const [skill, required] of Object.entries(conditions)) {
    if ((skillMap[skill] ?? 0) < required) {
      return { success: false, message: `加入条件を満たしていません。${skill}スキルが不足しています。` }
    }
  }

  await sql`
    INSERT INTO guild_memberships (guild_id, character_id)
    VALUES (${guildId}, ${characterId})
  `

  return { success: true, message: 'ギルドに加入しました。' }
}

/** ギルドメンバー一覧を取得 */
export async function getGuildMembers(guildId: string): Promise<{ name: string; status: string }[]> {
  return sql<{ name: string; status: string }[]>`
    SELECT c.name, c.status FROM guild_memberships gm
    JOIN characters c ON gm.character_id = c.id
    WHERE gm.guild_id = ${guildId} AND c.status != 'INACTIVE'
  `
}
