/**
 * 採掘・素材収集システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'
import { giveItem } from '../character/itemService.js'

export type GatherType = 'MINE' | 'CHOP_WOOD' | 'GATHER_HERBS' | 'FISH'

const GATHER_YIELDS: Record<GatherType, { itemName: string; baseDuration: number }> = {
  MINE:         { itemName: '鉄鉱石', baseDuration: 60 },
  CHOP_WOOD:    { itemName: '木材',     baseDuration: 45  },
  GATHER_HERBS: { itemName: '薬草',     baseDuration: 30  },
  FISH:         { itemName: '肉',       baseDuration: 45  },
}

/** 採集行動を開始する */
export async function startGather(
  characterId: string,
  gatherType: GatherType
): Promise<RegisterActionResult> {
  const char = await sql<{ villageId: string }[]>`
    SELECT village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'キャラクターが見つかりません。' }

  // 地域の資源残量確認
  const resource = await sql<{ population: number }[]>`
    SELECT population FROM ecosystem_states
    WHERE region_id = ${char[0].villageId} AND monster_type = ${gatherType}
    LIMIT 1
  `
  // ecosystem_statesで資源残量を管理（monster_typeを流用）
  // 残量0なら拒否
  if (resource[0] && resource[0].population <= 0) {
    return {
      success: false,
      errorCode: 'RESOURCE_DEPLETED' as never,
      message: 'この辺りでは最近見かけない。資源が枯渇している。',
    }
  }

  const { baseDuration } = GATHER_YIELDS[gatherType]
  return registerAction({
    characterId,
    actionType: gatherType === 'MINE' ? 'MINE'
      : gatherType === 'CHOP_WOOD' ? 'CHOP_WOOD'
      : gatherType === 'GATHER_HERBS' ? 'GATHER_HERBS'
      : 'FISH',
    parameters: { gatherType },
    durationOverrideMinutes: baseDuration,
  })
}

/** 採集完了時の処理 */
export async function completeGather(
  characterId: string,
  gatherType: GatherType
): Promise<string> {
  const char = await sql<{ skillMiningGrowth: number; fatigueInternal: number; villageId: string }[]>`
    SELECT skill_mining_growth, fatigue_internal, village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return '採集できませんでした。'

  const { itemName } = GATHER_YIELDS[gatherType]
  const fatigue = Math.max(0, Math.min(100, char[0].fatigueInternal))
  const fatigueMultiplier = 1.0 - (fatigue * 0.5 / 100)
  const skill = Math.floor(char[0].skillMiningGrowth * fatigueMultiplier)

  // 採掘は地形によって取得金属が変わる
  let actualItemName = itemName
  if (gatherType === 'MINE') {
    const village = await sql<{ terrainType: string }[]>`
      SELECT terrain_type FROM villages WHERE id = ${char[0].villageId} LIMIT 1
    `
    const terrain = village[0]?.terrainType || 'PLAIN'
    const metalMap: Record<string, string> = {
      PLAIN:     '鉄鉱石',
      MOUNTAIN:  'COPPER_ORE',
      FOREST:    'SILVER_ORE',
      RIVER:     'GOLD_ORE',
      DESERT:    'MITHRIL_ORE',
      SNOWFIELD: 'MITHRIL_ORE',
    }
    actualItemName = metalMap[terrain] ?? '鉄鉱石'
  }

  // 採集量（スキルに応じて増加）
  const amount = Math.max(1, Math.floor((1 + skill / 100 + Math.random()) * fatigueMultiplier))

  // アイテム追加
  const template = await sql<{ id: string }[]>`
    SELECT id FROM item_templates WHERE name = ${actualItemName} LIMIT 1
  `
  if (template[0]) {
    await giveItem(characterId, template[0].id, amount, {})
  }

  // 資源残量を減少
  await sql`
    INSERT INTO ecosystem_states (region_id, monster_type, population)
    VALUES (${char[0].villageId}, ${gatherType}, 10)
    ON CONFLICT (region_id, monster_type)
    DO UPDATE SET population = GREATEST(0, ecosystem_states.population - 1),
                  last_updated_at = NOW()
  `

  // Skill_Growth蓄積
  await sql`
    UPDATE characters
    SET skill_mining_growth = skill_mining_growth + ${Math.floor(Math.random() * 2) + 1}
    WHERE id = ${characterId}
  `

  return generateGatherText(gatherType, skill)
}

function generateGatherText(gatherType: GatherType, skill: number): string {
  const actions: Record<GatherType, string[]> = {
    MINE:         ['鉱山で鉄鉱石を掘り出した。', '岩を砕いて鉄鉱石を採取した。', '熟練した手つきで良質な鉄鉱石を掘り出した。'],
    CHOP_WOOD:    ['木を切り倒した。', '手際よく木材を確保した。', '無駄なく木を切り出した。'],
    GATHER_HERBS: ['薬草を摘んだ。', '良質な薬草を見つけた。', '薬草の見分け方が分かってきた。'],
    FISH:         ['川で魚を釣った。', 'いくつか魚が釣れた。', '大きな魚を釣り上げた。'],
  }
  const idx = skill < 50 ? 0 : skill < 200 ? 1 : 2
  return actions[gatherType][idx] ?? actions[gatherType][0]!
}
