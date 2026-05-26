/**
 * 採掘・素材収集システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

export type GatherType = 'MINE' | 'CHOP_WOOD' | 'GATHER_HERBS' | 'FISH'

const GATHER_YIELDS: Record<GatherType, { itemName: string; baseDuration: number }> = {
  MINE:         { itemName: 'IRON_ORE', baseDuration: 120 },
  CHOP_WOOD:    { itemName: 'WOOD',     baseDuration: 90  },
  GATHER_HERBS: { itemName: 'HERB',     baseDuration: 60  },
  FISH:         { itemName: 'MEAT',     baseDuration: 90  },
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
  const char = await sql<{ skillMiningGrowth: number; villageId: string }[]>`
    SELECT skill_mining_growth, village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return '採集できませんでした。'

  const { itemName } = GATHER_YIELDS[gatherType]
  const skill = char[0].skillMiningGrowth

  // 採集量（スキルに応じて増加）
  const amount = Math.max(1, Math.floor(1 + skill / 100 + Math.random()))

  // アイテム追加
  const template = await sql<{ id: string }[]>`
    SELECT id FROM item_templates WHERE name = ${itemName} LIMIT 1
  `
  if (template[0]) {
    await sql`
      INSERT INTO items (owner_character_id, item_template_id, quantity)
      VALUES (${characterId}, ${template[0].id}, ${amount})
    `
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
