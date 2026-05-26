/**
 * 市場・経済システム
 * 需要と供給による動的価格計算
 */
import { sql } from '../db/client.js'

export interface MarketItem {
  itemTemplateId: string
  name: string
  currentPrice: number
  basePrice: number
  stockQuantity: number
}

/**
 * 市場価格計算（Property 7: 基準価格の50%〜200%の範囲）
 * 需要のない村では安くなる
 */
export function calculateMarketPrice(
  basePrice: number,
  stockQuantity: number,
  recentSales: number,
  villageDevelopmentLevel: number = 5
): number {
  // 在庫が多いほど価格低下、売れるほど価格上昇
  const supplyFactor = stockQuantity > 0 ? Math.max(0.5, 1 - stockQuantity / 200) : 1.5
  const demandFactor = 1 + recentSales / 100
  // 発展度が低い村では需要が少なく安くなる
  const developmentFactor = 0.7 + (villageDevelopmentLevel / 10) * 0.6

  const price = Math.round(basePrice * supplyFactor * demandFactor * developmentFactor)
  return Math.max(Math.ceil(basePrice * 0.5), Math.min(Math.floor(basePrice * 2.0), price))
}

/** 村の市場価格一覧を取得 */
export async function getMarketListings(villageId: string): Promise<MarketItem[]> {
  const rows = await sql<{
    itemTemplateId: string
    name: string
    currentPrice: number
    basePrice: number
    stockQuantity: number
  }[]>`
    SELECT
      ml.item_template_id,
      it.name,
      ml.current_price,
      ml.base_price,
      ml.stock_quantity
    FROM market_listings ml
    JOIN item_templates it ON ml.item_template_id = it.id
    WHERE ml.village_id = ${villageId}
    ORDER BY it.category, it.name
  `
  return rows
}

/** アイテムを売却する */
export async function sellItem(
  characterId: string,
  itemId: string,
  villageId: string
): Promise<{ success: boolean; goldEarned?: number; message?: string }> {
  // アイテム確認
  const items = await sql<{ id: string; itemTemplateId: string; quantity: number }[]>`
    SELECT id, item_template_id, quantity
    FROM items WHERE id = ${itemId} AND owner_character_id = ${characterId} LIMIT 1
  `
  if (!items[0]) return { success: false, message: 'アイテムが見つかりません。' }

  const item = items[0]

  // 市場価格取得
  const listings = await sql<{ currentPrice: number; stockQuantity: number }[]>`
    SELECT current_price, stock_quantity
    FROM market_listings
    WHERE village_id = ${villageId} AND item_template_id = ${item.itemTemplateId}
    LIMIT 1
  `
  if (!listings[0]) return { success: false, message: 'この村では取引できません。' }

  const sellPrice = Math.floor(listings[0].currentPrice * 0.7) // 売却価格は市場価格の70%

  await sql.begin(async (tx) => {
    // 所持金増加と商売スキルの成長
    await tx`
      UPDATE characters 
      SET gold = gold + ${sellPrice}, 
          skill_trading_growth = skill_trading_growth + ${Math.floor(Math.random() * 2) + 1},
          updated_at = NOW()
      WHERE id = ${characterId}
    `
    // アイテム削除
    await tx`DELETE FROM items WHERE id = ${itemId}`
    // 市場在庫更新・価格再計算
    const newStock = listings[0]!.stockQuantity + 1
    const newPrice = calculateMarketPrice(
      await getBasePrice(item.itemTemplateId),
      newStock,
      0
    )
    await tx`
      UPDATE market_listings
      SET stock_quantity = ${newStock}, current_price = ${newPrice}, updated_at = NOW()
      WHERE village_id = ${villageId} AND item_template_id = ${item.itemTemplateId}
    `
    // 価格履歴記録
    await tx`
      INSERT INTO market_price_history (village_id, item_template_id, price)
      VALUES (${villageId}, ${item.itemTemplateId}, ${newPrice})
    `
  })

  return { success: true, goldEarned: sellPrice }
}

/** アイテムを購入する */
export async function buyItem(
  characterId: string,
  itemTemplateId: string,
  villageId: string
): Promise<{ success: boolean; goldSpent?: number; message?: string }> {
  const char = await sql<{ gold: number }[]>`
    SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, message: 'キャラクターが見つかりません。' }

  const listing = await sql<{ currentPrice: number; stockQuantity: number; basePrice: number }[]>`
    SELECT current_price, stock_quantity, base_price
    FROM market_listings
    WHERE village_id = ${villageId} AND item_template_id = ${itemTemplateId}
    LIMIT 1
  `
  if (!listing[0] || listing[0].stockQuantity <= 0) {
    return { success: false, message: '在庫がありません。' }
  }

  const buyPrice = Math.ceil(listing[0].currentPrice * 1.2) // 購入価格は市場価格の120%
  if (char[0].gold < buyPrice) {
    return { success: false, message: `所持金が足りません。必要: ${buyPrice}G` }
  }

  // インベントリ上限確認（50スロット）
  const invCount = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM items WHERE owner_character_id = ${characterId}
  `
  if (parseInt(invCount[0]?.count ?? '0') >= 50) {
    return { success: false, errorCode: 'INVENTORY_FULL', message: 'インベントリが満杯です。' } as never
  }

  await sql.begin(async (tx) => {
    await tx`
      UPDATE characters 
      SET gold = gold - ${buyPrice}, 
          skill_trading_growth = skill_trading_growth + ${Math.floor(Math.random() * 2) + 1},
          updated_at = NOW()
      WHERE id = ${characterId}
    `
    await tx`
      INSERT INTO items (owner_character_id, item_template_id, quantity)
      VALUES (${characterId}, ${itemTemplateId}, 1)
    `
    const newStock = listing[0]!.stockQuantity - 1
    const newPrice = calculateMarketPrice(listing[0]!.basePrice, newStock, 1)
    await tx`
      UPDATE market_listings
      SET stock_quantity = ${newStock}, current_price = ${newPrice}, updated_at = NOW()
      WHERE village_id = ${villageId} AND item_template_id = ${itemTemplateId}
    `
  })

  return { success: true, goldSpent: buyPrice }
}

async function getBasePrice(itemTemplateId: string): Promise<number> {
  const rows = await sql<{ basePrice: number }[]>`
    SELECT base_price FROM item_templates WHERE id = ${itemTemplateId} LIMIT 1
  `
  return rows[0]?.basePrice ?? 10
}
