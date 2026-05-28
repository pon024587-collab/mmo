/**
 * ギルド・組合システム
 */
import { sql } from '../db/client.js'

export type GuildType = 'ADVENTURER' | 'FARMER' | 'MERCHANT' | 'MAGE' | 'PLAYER'

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

/** プレイヤーギルドを設立する */
export async function createGuild(
  characterId: string,
  name: string,
  requiresApproval: boolean = false
): Promise<{ success: boolean; message?: string }> {
  // プレイヤーが既に他のプレイヤーギルドに所属しているかチェック
  const existing = await sql<{ guildId: string }[]>`
    SELECT gm.guild_id FROM guild_memberships gm
    JOIN guilds g ON gm.guild_id = g.id
    WHERE gm.character_id = ${characterId} AND g.guild_type = 'PLAYER'
    LIMIT 1
  `
  if (existing[0]) return { success: false, message: 'すでにプレイヤーギルドに所属しています。' }

  // ギルド名重複チェック
  const nameCheck = await sql<{ id: string }[]>`SELECT id FROM guilds WHERE name = ${name} LIMIT 1`
  if (nameCheck[0]) return { success: false, message: 'その名前のギルドはすでに存在します。' }

  // 所持金チェック (設立費用1万Gとする)
  const char = await sql<{ gold: number }[]>`SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1`
  if ((char[0]?.gold ?? 0) < 10000) return { success: false, message: 'ギルド設立には10,000G必要です。' }

  await sql.begin(async (tx) => {
    // 資金消費
    await tx`UPDATE characters SET gold = gold - 10000 WHERE id = ${characterId}`
    // ギルド設立
    const g = await tx<{ id: string }[]>`
      INSERT INTO guilds (name, guild_type, description, owner_character_id, requires_approval)
      VALUES (${name}, 'PLAYER', 'プレイヤー設立ギルド', ${characterId}, ${requiresApproval})
      RETURNING id
    `
    // 加入
    if (g[0]) {
      await tx`
        INSERT INTO guild_memberships (guild_id, character_id)
        VALUES (${g[0].id}, ${characterId})
      `
    }
  })

  return { success: true, message: `ギルド【${name}】を設立しました！` }
}

/** プレイヤーギルド一覧を取得 */
export async function getPlayerGuilds(characterId?: string) {
  return await sql<{ id: string; name: string; memberCount: number; requiresApproval: boolean; isMember: boolean; hasApplied: boolean }[]>`
    SELECT 
      g.id, g.name, COUNT(gm.character_id)::int as member_count, g.requires_approval,
      BOOL_OR(gm.character_id = ${characterId ?? null}) as is_member,
      EXISTS(SELECT 1 FROM guild_applications ga WHERE ga.guild_id = g.id AND ga.character_id = ${characterId ?? null} AND ga.status = 'PENDING') as has_applied
    FROM guilds g
    LEFT JOIN guild_memberships gm ON g.id = gm.guild_id
    WHERE g.guild_type = 'PLAYER'
    GROUP BY g.id, g.name, g.requires_approval
    ORDER BY member_count DESC, g.name ASC
  `
}

/** ギルドに申請（または直接加入）する */
export async function applyToGuild(characterId: string, guildId: string, message: string = ''): Promise<{ success: boolean; message?: string }> {
  const g = await sql<{ requiresApproval: boolean; guildType: string }[]>`
    SELECT requires_approval, guild_type FROM guilds WHERE id = ${guildId} LIMIT 1
  `
  if (!g[0]) return { success: false, message: 'ギルドが存在しません。' }

  // プレイヤーギルド所属チェック
  if (g[0].guildType === 'PLAYER') {
    const existing = await sql<{ guildId: string }[]>`
      SELECT gm.guild_id FROM guild_memberships gm
      JOIN guilds g2 ON gm.guild_id = g2.id
      WHERE gm.character_id = ${characterId} AND g2.guild_type = 'PLAYER' LIMIT 1
    `
    if (existing[0]) return { success: false, message: 'すでに他のプレイヤーギルドに所属しています。' }
  }

  if (g[0].requiresApproval) {
    // 申請を出す
    const prev = await sql<{ id: string }[]>`
      SELECT id FROM guild_applications WHERE guild_id = ${guildId} AND character_id = ${characterId} AND status = 'PENDING'
    `
    if (prev[0]) return { success: false, message: 'すでに申請済みです。' }
    await sql`
      INSERT INTO guild_applications (guild_id, character_id, message)
      VALUES (${guildId}, ${characterId}, ${message})
    `
    return { success: true, message: 'ギルドに加入申請を送りました！' }
  } else {
    // 即加入
    return joinGuild(characterId, guildId)
  }
}

/** ギルド詳細（メンバーや申請一覧）取得（自分が所属しているギルドのみ） */
export async function getMyGuildDetails(characterId: string) {
  const g = await sql<{ id: string; name: string; ownerCharacterId: string; requiresApproval: boolean }[]>`
    SELECT g.id, g.name, g.owner_character_id, g.requires_approval
    FROM guilds g
    JOIN guild_memberships gm ON g.id = gm.guild_id
    WHERE gm.character_id = ${characterId} AND g.guild_type = 'PLAYER'
    LIMIT 1
  `
  if (!g[0]) return null

  const members = await sql<{ id: string; name: string; joinedAt: Date; role: string }[]>`
    SELECT c.id, c.name, gm.joined_at, 
      CASE WHEN g.owner_character_id = c.id THEN 'MASTER' ELSE 'MEMBER' END as role
    FROM guild_memberships gm
    JOIN characters c ON gm.character_id = c.id
    JOIN guilds g ON gm.guild_id = g.id
    WHERE gm.guild_id = ${g[0].id}
    ORDER BY role DESC, gm.joined_at ASC
  `

  let applications: any[] = []
  if (g[0].ownerCharacterId === characterId) {
    applications = await sql<{ id: string; characterId: string; characterName: string; message: string; appliedAt: Date }[]>`
      SELECT ga.id, ga.character_id, c.name as character_name, ga.message, ga.applied_at
      FROM guild_applications ga
      JOIN characters c ON ga.character_id = c.id
      WHERE ga.guild_id = ${g[0].id} AND ga.status = 'PENDING'
      ORDER BY ga.applied_at ASC
    `
  }

  return { ...g[0], members, applications }
}

/** 申請の承認・拒否 (マスターのみ) */
export async function manageGuildApplication(
  ownerId: string, applicationId: string, approve: boolean
): Promise<{ success: boolean; message?: string }> {
  const app = await sql<{ guildId: string; characterId: string; status: string }[]>`
    SELECT guild_id, character_id, status FROM guild_applications WHERE id = ${applicationId}
  `
  if (!app[0] || app[0].status !== 'PENDING') return { success: false, message: '無効な申請です。' }

  const g = await sql<{ ownerCharacterId: string }[]>`SELECT owner_character_id FROM guilds WHERE id = ${app[0].guildId}`
  if (g[0]?.ownerCharacterId !== ownerId) return { success: false, message: '権限がありません。' }

  await sql.begin(async (tx) => {
    await tx`UPDATE guild_applications SET status = ${approve ? 'APPROVED' : 'REJECTED'} WHERE id = ${applicationId}`
    if (approve) {
      await tx`INSERT INTO guild_memberships (guild_id, character_id) VALUES (${app[0]!.guildId}, ${app[0]!.characterId}) ON CONFLICT DO NOTHING`
    }
  })
  return { success: true, message: approve ? '申請を承認し、メンバーを迎え入れました。' : '申請を拒否しました。' }
}

/** メンバーの追放 (マスターのみ) */
export async function kickGuildMember(
  ownerId: string, guildId: string, targetCharacterId: string
): Promise<{ success: boolean; message?: string }> {
  const g = await sql<{ ownerCharacterId: string }[]>`SELECT owner_character_id FROM guilds WHERE id = ${guildId}`
  if (g[0]?.ownerCharacterId !== ownerId) return { success: false, message: '権限がありません。' }
  if (ownerId === targetCharacterId) return { success: false, message: 'マスター自身を追放することはできません。' }

  await sql`DELETE FROM guild_memberships WHERE guild_id = ${guildId} AND character_id = ${targetCharacterId}`
  return { success: true, message: 'メンバーを追放しました。' }
}

/** ギルドから脱退する */
export async function leaveGuild(characterId: string, guildId: string): Promise<{ success: boolean; message?: string }> {
  const g = await sql<{ ownerCharacterId: string }[]>`SELECT owner_character_id FROM guilds WHERE id = ${guildId}`
  if (g[0]?.ownerCharacterId === characterId) return { success: false, message: 'マスターは脱退できません。' }

  await sql`DELETE FROM guild_memberships WHERE guild_id = ${guildId} AND character_id = ${characterId}`
  return { success: true, message: 'ギルドから脱退しました。' }
}
