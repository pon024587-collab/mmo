/**
 * 装備強化システム (+1〜+9)
 * 地形ごとの金属素材とゴールドを消費し、確率で成功・失敗・破壊が発生する
 */
import { sql } from '../db/client.js'

// 強化段階ごとの設定
export const ENHANCE_TABLE = [
  // level, metalName,    metalCount, goldCost, successRate, destroyRate
  { level: 1, metal: 'IRON_ORE',    count: 3,  gold: 100,    success: 0.95, destroy: 0.00 },
  { level: 2, metal: 'IRON_ORE',    count: 6,  gold: 300,    success: 0.90, destroy: 0.00 },
  { level: 3, metal: 'COPPER_ORE',  count: 3,  gold: 800,    success: 0.80, destroy: 0.01 },
  { level: 4, metal: 'COPPER_ORE',  count: 6,  gold: 2000,   success: 0.65, destroy: 0.03 },
  { level: 5, metal: 'SILVER_ORE',  count: 3,  gold: 6000,   success: 0.50, destroy: 0.07 },
  { level: 6, metal: 'SILVER_ORE',  count: 6,  gold: 15000,  success: 0.35, destroy: 0.12 },
  { level: 7, metal: 'GOLD_ORE',    count: 3,  gold: 40000,  success: 0.22, destroy: 0.20 },
  { level: 8, metal: 'GOLD_ORE',    count: 6,  gold: 100000, success: 0.12, destroy: 0.30 },
  { level: 9, metal: 'MITHRIL_ORE', count: 3,  gold: 300000, success: 0.05, destroy: 0.45 },
]

export async function enhanceEquipment(
  characterId: string,
  itemId: string
): Promise<{ success: boolean; message: string; result: 'SUCCESS' | 'FAIL' | 'DESTROY' }> {
  // 装備を取得
  const itemRows = await sql<{ id: string; metadata: any; name: string; category: string }[]>`
    SELECT i.id, i.metadata, it.name, it.category
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.id = ${itemId} AND i.owner_character_id = ${characterId}
    LIMIT 1
  `
  if (!itemRows[0]) return { success: false, message: 'アイテムが見つかりません。', result: 'FAIL' }
  const item = itemRows[0]

  // 行動中は強化不可（アイテムが消費中の場合）
  const activeUse = await sql<{ id: string }[]>`
    SELECT id FROM action_queue
    WHERE character_id = ${characterId}
      AND status = 'ACTIVE'
      AND parameters->>'itemId' = ${itemId}
    LIMIT 1
  `
  if (activeUse[0]) {
    return { success: false, message: '現在使用中のアイテムは強化できません。', result: 'FAIL' }
  }

  if (item.category !== 'WEAPON' && item.category !== 'ARMOR') {
    return { success: false, message: '武器か防具のみ強化できます。', result: 'FAIL' }
  }

  const meta = item.metadata || {}
  const currentLevel = meta.enhance ?? 0
  if (currentLevel >= 9) {
    return { success: false, message: 'すでに最大強化（+9）です。', result: 'FAIL' }
  }

  const config = ENHANCE_TABLE[currentLevel]!

  // ゴールド確認
  const charRows = await sql<{ gold: number }[]>`SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1`
  if (!charRows[0] || charRows[0].gold < config.gold) {
    return { success: false, message: `ゴールドが不足しています。必要: ${config.gold.toLocaleString()}G`, result: 'FAIL' }
  }

  // 素材確認
  const matRows = await sql<{ id: string; quantity: number }[]>`
    SELECT i.id, i.quantity FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId} AND it.name = ${config.metal}
    ORDER BY i.quantity ASC
  `
  const totalMat = matRows.reduce((s, r) => s + r.quantity, 0)
  if (totalMat < config.count) {
    const metalLabels: Record<string, string> = {
      IRON_ORE: '鉄鉱石', COPPER_ORE: '銅鉱石', SILVER_ORE: '銀鉱石',
      GOLD_ORE: '金鉱石', MITHRIL_ORE: 'ミスリル鉱石'
    }
    return {
      success: false,
      message: `素材が不足しています。${metalLabels[config.metal] ?? config.metal} × ${config.count} 必要 (所持: ${totalMat})`,
      result: 'FAIL'
    }
  }

  // ゴールドと素材を消費
  await sql`UPDATE characters SET gold = gold - ${config.gold} WHERE id = ${characterId}`
  let remaining = config.count
  for (const mat of matRows) {
    if (remaining <= 0) break
    const use = Math.min(mat.quantity, remaining)
    if (use >= mat.quantity) {
      await sql`DELETE FROM items WHERE id = ${mat.id}`
    } else {
      await sql`UPDATE items SET quantity = quantity - ${use} WHERE id = ${mat.id}`
    }
    remaining -= use
  }

  // 結果判定
  const roll = Math.random()
  if (roll < config.destroy) {
    // 破壊
    await sql`DELETE FROM items WHERE id = ${itemId}`
    return {
      success: false,
      message: `【強化失敗・破壊】${item.name}(+${currentLevel}) の強化に失敗し、装備が砕け散った…`,
      result: 'DESTROY'
    }
  } else if (roll < config.destroy + (1 - config.success)) {
    // 失敗（素材とゴールドだけ消費）
    return {
      success: false,
      message: `【強化失敗】${item.name}(+${currentLevel}) の強化に失敗した。素材は失われた。`,
      result: 'FAIL'
    }
  } else {
    // 成功
    meta.enhance = currentLevel + 1
    await sql`UPDATE items SET metadata = ${JSON.stringify(meta)}::jsonb WHERE id = ${itemId}`
    return {
      success: true,
      message: `【強化成功！】${item.name} が +${currentLevel + 1} になった！`,
      result: 'SUCCESS'
    }
  }
}
