/**
 * ダンジョン探索・料理・家畜・行商（簡略実装）
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

// ---- ダンジョン探索 ----

export async function exploreDungeon(
  characterId: string,
  dungeonId: string
): Promise<RegisterActionResult> {
  return registerAction({
    characterId,
    actionType: 'DUNGEON_EXPLORE',
    parameters: { dungeonId },
    durationOverrideMinutes: 30,
  })
}

export async function completeDungeonFloor(
  characterId: string,
  dungeonId: string
): Promise<string> {
  const events = ['魔物と遭遇した！なんとか倒した。', '宝箱を発見した。', '罠にかかったが軽傷で済んだ。', '何もなかった。次の階へ進む。']
  const event = events[Math.floor(Math.random() * events.length)]!

  // 宝箱の場合アイテムを付与
  if (event.includes('宝箱')) {
    const templates = await sql<{ id: string }[]>`
      SELECT id FROM item_templates ORDER BY RANDOM() LIMIT 1
    `
    if (templates[0]) {
      await sql`
        INSERT INTO items (owner_character_id, item_template_id, quantity)
        VALUES (${characterId}, ${templates[0].id}, 1)
      `
    }
  }

  return event
}

// ---- 料理 ----

export async function cook(
  characterId: string,
  recipeType: 'BREAD' | 'STEW' | 'HERBAL_TEA'
): Promise<RegisterActionResult> {
  const ingredients: Record<string, string[]> = {
    BREAD: ['WHEAT'],
    STEW: ['MEAT', 'CARROT'],
    HERBAL_TEA: ['HERB'],
  }
  const needed = ingredients[recipeType] ?? []

  for (const ing of needed) {
    const item = await sql<{ id: string }[]>`
      SELECT i.id FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.owner_character_id = ${characterId} AND it.name = ${ing} LIMIT 1
    `
    if (!item[0]) {
      return { success: false, errorCode: 'MISSING_PREREQUISITE', message: `素材が足りません: ${ing}` }
    }
  }

  return registerAction({
    characterId,
    actionType: 'COOK',
    parameters: { recipeType },
    durationOverrideMinutes: 60,
  })
}

export async function completeCook(characterId: string, recipeType: string): Promise<string> {
  const skill = await sql<{ skillCookingGrowth: number; fatigueInternal: number }[]>`
    SELECT skill_cooking_growth, fatigue_internal FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const rawSkill = skill[0]?.skillCookingGrowth ?? 0
  const fatigue = Math.max(0, Math.min(100, skill[0]?.fatigueInternal ?? 0))
  const s = Math.floor(rawSkill * (1.0 - fatigue * 0.5 / 100))

  // 完成品をインベントリに追加
  const outputMap: Record<string, string> = { BREAD: 'BREAD', STEW: 'MEAT', HERBAL_TEA: 'HERB' }
  const output = outputMap[recipeType] ?? 'BREAD'
  const template = await sql<{ id: string }[]>`
    SELECT id FROM item_templates WHERE name = ${output} LIMIT 1
  `
  if (template[0]) {
    await sql`
      INSERT INTO items (owner_character_id, item_template_id, quantity)
      VALUES (${characterId}, ${template[0].id}, 1)
    `
  }

  await sql`
    UPDATE characters SET skill_cooking_growth = skill_cooking_growth + 1 WHERE id = ${characterId}
  `

  if (s < 50) return `${recipeType}を作った。素朴な味だ。`
  if (s < 200) return `${recipeType}を作った。なかなかの出来だ。`
  return `${recipeType}を作った。絶品だ。`
}

// ---- 家畜 ----

export async function buyLivestock(
  characterId: string,
  animalType: 'HORSE' | 'COW' | 'SHEEP' | 'CHICKEN' | 'DOG'
): Promise<{ success: boolean; message?: string }> {
  const prices: Record<string, number> = { HORSE: 200, COW: 150, SHEEP: 80, CHICKEN: 30, DOG: 50 }
  const price = prices[animalType] ?? 100

  const char = await sql<{ gold: number; villageId: string }[]>`
    SELECT gold, village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0] || char[0].gold < price) {
    return { success: false, message: `所持金が足りません。必要: ${price}G` }
  }

  await sql.begin(async (tx) => {
    await tx`UPDATE characters SET gold = gold - ${price}, updated_at = NOW() WHERE id = ${characterId}`
    await tx`
      INSERT INTO livestock (character_id, animal_type, village_id)
      VALUES (${characterId}, ${animalType}, ${char[0]!.villageId})
    `
  })

  return { success: true, message: `${animalType}を購入しました。` }
}

// ---- 行商 ----

export async function startTradeRoute(
  characterId: string,
  targetVillageId: string,
  itemIds: string[]
): Promise<RegisterActionResult> {
  if (itemIds.length === 0) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '運搬するアイテムを選択してください。' }
  }

  // 移動時間（荷物量に応じて増加）
  const baseDuration = 60
  const durationMinutes = baseDuration + itemIds.length * 10

  return registerAction({
    characterId,
    actionType: 'MOVE',
    parameters: { targetVillageId, tradeItemIds: itemIds },
    durationOverrideMinutes: durationMinutes,
  })
}
