/**
 * 地形影響・建築・インフラシステム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

export type TerrainType = 'PLAIN' | 'FOREST' | 'MOUNTAIN' | 'RIVER' | 'DESERT' | 'SNOWFIELD'

/** 地形による移動時間補正（分） */
export function getTerrainMovementMultiplier(terrain: TerrainType): number {
  const multipliers: Record<TerrainType, number> = {
    PLAIN:     1.0,
    FOREST:    1.3,
    MOUNTAIN:  2.0,
    RIVER:     1.5, // 橋なし
    DESERT:    1.4,
    SNOWFIELD: 1.6,
  }
  return multipliers[terrain] ?? 1.0
}

/** 地形による農業適性補正 */
export function getTerrainFarmingMultiplier(terrain: TerrainType): number {
  const multipliers: Record<TerrainType, number> = {
    PLAIN:     1.0,
    FOREST:    0.7,
    MOUNTAIN:  0.4,
    RIVER:     1.1,
    DESERT:    0.3,
    SNOWFIELD: 0.2,
  }
  return multipliers[terrain] ?? 1.0
}

/** 地形による疲労蓄積補正 */
export function getTerrainFatigueMultiplier(terrain: TerrainType): number {
  const multipliers: Record<TerrainType, number> = {
    PLAIN:     1.0,
    FOREST:    1.2,
    MOUNTAIN:  1.5,
    RIVER:     1.2,
    DESERT:    1.3,
    SNOWFIELD: 1.4,
  }
  return multipliers[terrain] ?? 1.0
}

/** 橋を建設する */
export async function buildBridge(
  characterId: string,
  villageId: string
): Promise<RegisterActionResult> {
  // 必要素材: 木材×10、石材×5
  const wood = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId} AND it.name = 'WOOD'
  `
  const stone = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId} AND it.name = 'STONE'
  `
  if (parseInt(wood[0]?.count ?? '0') < 10 || parseInt(stone[0]?.count ?? '0') < 5) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '素材が足りません。木材×10、石材×5が必要です。' }
  }

  return registerAction({
    characterId,
    actionType: 'BUILD_BRIDGE',
    parameters: { villageId, structureType: 'BRIDGE' },
    durationOverrideMinutes: 360,
  })
}

/** 井戸を建設する */
export async function buildWell(
  characterId: string,
  villageId: string
): Promise<RegisterActionResult> {
  const stone = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId} AND it.name = 'STONE'
  `
  if (parseInt(stone[0]?.count ?? '0') < 8) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '素材が足りません。石材×8が必要です。' }
  }

  return registerAction({
    characterId,
    actionType: 'BUILD_HOUSE',
    parameters: { villageId, structureType: 'WELL' },
    durationOverrideMinutes: 120,
  })
}

/** 建築完了時の処理 */
export async function completeStructure(
  characterId: string,
  villageId: string,
  structureType: string
): Promise<string> {
  await sql`
    INSERT INTO structures (village_id, structure_type, built_by)
    VALUES (${villageId}, ${structureType}, ${characterId})
  `

  const names: Record<string, string> = {
    BRIDGE: '橋が完成した。川を渡りやすくなった。',
    WELL: '井戸が完成した。村人たちが水を汲みやすくなった。',
    ROAD: '道が整備された。移動が楽になった。',
  }
  return names[structureType] ?? '建築が完了した。'
}
