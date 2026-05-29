import { sql } from '../db/client.js'

export async function getPlayerMarketListings(villageId: string) {
  const listings = await sql<{
    id: string
    sellerId: string
    sellerName: string
    price: number
    itemId: string
    itemName: string
    category: string
    metadata: any
    quantity: number
    durability: number | null
  }[]>`
    SELECT 
      p.id,
      p.seller_character_id as seller_id,
      c.name as seller_name,
      p.price,
      i.id as item_id,
      it.name as item_name,
      it.category,
      i.metadata,
      i.quantity,
      i.durability
    FROM player_market_listings p
    JOIN characters c ON p.seller_character_id = c.id
    JOIN items i ON p.item_id = i.id
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE p.village_id = ${villageId} AND p.is_sold = false
    ORDER BY p.created_at DESC
  `
  return listings
}

export async function listPlayerItem(characterId: string, villageId: string, itemId: string, price: number, quantity: number = 1) {
  // Check if player has a house in this village
  const housing = await sql<{ id: string }[]>`
    SELECT h.id FROM housings h
    JOIN lands l ON h.land_id = l.id
    WHERE h.owner_character_id = ${characterId} AND l.village_id = ${villageId}
  `
  if (housing.length === 0) {
    return { success: false, message: 'この村に家を持っていないため露店を開けません。' }
  }

  // Check 10 items limit
  const activeListings = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM player_market_listings
    WHERE seller_character_id = ${characterId} AND is_sold = false
  `
  if (parseInt(activeListings[0]?.count ?? '0') >= 10) {
    return { success: false, message: '露店に出品できるアイテムは最大10個までです。' }
  }

  // Check item ownership and unequip if needed
  const items = await sql<{ id: string; quantity: number; itemTemplateId: string; metadata: any; durability: number | null; qualityInternal: number }[]>`
    SELECT id, quantity, item_template_id, metadata, durability, quality_internal
    FROM items WHERE id = ${itemId} AND owner_character_id = ${characterId}
  `
  if (items.length === 0) {
    return { success: false, message: 'アイテムが見つかりません。' }
  }
  const item = items[0]
  if (item.quantity < quantity || quantity <= 0) {
    return { success: false, message: '指定した個数がありません。' }
  }

  // 行動中に使用予定のアイテムは出品不可
  const activeAction = await sql<{ id: string }[]>`
    SELECT id FROM action_queue
    WHERE character_id = ${characterId}
      AND status = 'ACTIVE'
      AND parameters->>'itemId' = ${itemId}
    LIMIT 1
  `
  if (activeAction[0]) {
    return { success: false, message: '現在使用中のアイテムは出品できません。行動完了後にお試しください。' }
  }

  // Ensure item is not equipped
  const char = await sql<{ equippedWeaponId: string | null; equippedArmorId: string | null; equippedAccessoryId: string | null }[]>`
    SELECT equipped_weapon_id, equipped_armor_id, equipped_accessory_id FROM characters WHERE id = ${characterId}
  `
  if (char[0]) {
    if (char[0].equippedWeaponId === itemId) await sql`UPDATE characters SET equipped_weapon_id = NULL WHERE id = ${characterId}`
    if (char[0].equippedArmorId === itemId) await sql`UPDATE characters SET equipped_armor_id = NULL WHERE id = ${characterId}`
    if (char[0].equippedAccessoryId === itemId) await sql`UPDATE characters SET equipped_accessory_id = NULL WHERE id = ${characterId}`
  }

  // Move item out of inventory logic? Actually, we can keep it in items but mark it as listed.
  // Wait, if it's in items, player might eat or use it. We should move its ownership to NULL or create a market_status.
  // Or simply transfer ownership to NULL and link via player_market_listings.
  // The simplest is to transfer owner_character_id to NULL to hide from inventory, and the market listing holds it.
  
  await sql.begin(async tx => {
    let listedItemId = itemId
    if (item.quantity > quantity) {
      // 一部のみ出品する場合はスタックを分割
      await tx`UPDATE items SET quantity = quantity - ${quantity} WHERE id = ${itemId}`
      const newItems = await tx<{ id: string }[]>`
        INSERT INTO items (owner_character_id, owner_housing_id, item_template_id, metadata, quantity, durability, quality_internal)
        VALUES (NULL, NULL, ${item.itemTemplateId}, ${item.metadata}, ${quantity}, ${item.durability}, ${item.qualityInternal})
        RETURNING id
      `
      listedItemId = newItems[0].id
    } else {
      // 全部出品する場合は所有者をNULLに
      await tx`UPDATE items SET owner_character_id = NULL WHERE id = ${itemId}`
    }

    await tx`
      INSERT INTO player_market_listings (seller_character_id, village_id, item_id, price)
      VALUES (${characterId}, ${villageId}, ${listedItemId}, ${price})
    `
  })

  return { success: true, message: 'アイテムを露店に出品しました。' }
}

export async function buyPlayerItem(buyerId: string, listingId: string) {
  const listing = await sql<{ id: string; sellerId: string; itemId: string; price: number; isSold: boolean; villageId: string }[]>`
    SELECT id, seller_character_id as seller_id, item_id, price, is_sold, village_id
    FROM player_market_listings
    WHERE id = ${listingId}
  `
  if (listing.length === 0 || listing[0].isSold) {
    return { success: false, message: 'この商品は既に売れているか、存在しません。' }
  }
  const l = listing[0]

  if (l.sellerId === buyerId) {
    return { success: false, message: '自分の商品は購入できません。' }
  }

  const buyer = await sql<{ gold: number }[]>`SELECT gold FROM characters WHERE id = ${buyerId}`
  if (!buyer[0] || buyer[0].gold < l.price) {
    return { success: false, message: '所持金が足りません。' }
  }

  // Check inventory space
  const invCount = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM items WHERE owner_character_id = ${buyerId}`
  if (parseInt(invCount[0]?.count ?? '0') >= 50) {
    return { success: false, message: 'インベントリがいっぱいです。' }
  }

  await sql.begin(async tx => {
    // Deduct money from buyer
    await tx`UPDATE characters SET gold = gold - ${l.price} WHERE id = ${buyerId}`
    // Add money to seller
    await tx`UPDATE characters SET gold = gold + ${l.price} WHERE id = ${l.sellerId}`
    // Give item to buyer
    await tx`UPDATE items SET owner_character_id = ${buyerId} WHERE id = ${l.itemId}`
    // Mark as sold
    await tx`UPDATE player_market_listings SET is_sold = true, sold_at = NOW() WHERE id = ${listingId}`
    // Notify in chat (optional)
  })

  return { success: true, message: '商品を購入しました！' }
}

export async function cancelPlayerItemListing(characterId: string, listingId: string) {
  const listing = await sql<{ id: string; sellerId: string; itemId: string; isSold: boolean }[]>`
    SELECT id, seller_character_id as seller_id, item_id, is_sold
    FROM player_market_listings
    WHERE id = ${listingId}
  `
  if (listing.length === 0 || listing[0].isSold) {
    return { success: false, message: 'この商品は既に売れているか、存在しません。' }
  }
  if (listing[0].sellerId !== characterId) {
    return { success: false, message: 'あなたの出品ではありません。' }
  }

  // Check inventory space
  const invCount = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM items WHERE owner_character_id = ${characterId}`
  if (parseInt(invCount[0]?.count ?? '0') >= 50) {
    return { success: false, message: 'インベントリがいっぱいで引き取れません。' }
  }

  await sql.begin(async tx => {
    await tx`UPDATE items SET owner_character_id = ${characterId} WHERE id = ${listing[0].itemId}`
    await tx`DELETE FROM player_market_listings WHERE id = ${listingId}`
  })

  return { success: true, message: '出品を取り消しました。' }
}
