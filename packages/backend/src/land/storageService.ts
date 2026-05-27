/**
 * 住居倉庫システム
 * - 家に依存したアイテム保管
 * - housing_type によって最大スロット数が異なる
 *   SHACK: 0枠, NORMAL: 30枠, RICH: 50枠, MANSION: 100枠
 */
import { sql } from '../db/client.js'

interface StorageItem {
  id: string
  name: string
  category: string
  quantity: number
  durability: number | null
  metadata: any
}

interface HousingInfo {
  id: string
  slotsUsed: number
  slotsMax: number
  housingType: string
  villageId: string
}

/** キャラクターの住居情報を取得 */
async function getHousingForCharacter(characterId: string): Promise<HousingInfo | null> {
  const rows = await sql<{
    id: string
    storageSlotsUsed: number
    storageSlotsMax: number
    housingType: string
    villageId: string
  }[]>`
    SELECT h.id, h.storage_slots_used, h.storage_slots_max, h.housing_type, h.village_id
    FROM housings h
    WHERE h.character_id = ${characterId}
    LIMIT 1
  `
  if (!rows[0]) return null
  return {
    id: rows[0].id,
    slotsUsed: rows[0].storageSlotsUsed,
    slotsMax: rows[0].storageSlotsMax,
    housingType: rows[0].housingType,
    villageId: rows[0].villageId,
  }
}

/** 倉庫内アイテム一覧取得 */
export async function getStorageItems(characterId: string): Promise<{
  success: boolean
  items?: StorageItem[]
  slotsUsed?: number
  slotsMax?: number
  housingType?: string
  message?: string
}> {
  const housing = await getHousingForCharacter(characterId)
  if (!housing) {
    return { success: false, message: '家を所有していません。倉庫を使うには家が必要です。' }
  }
  if (housing.slotsMax === 0) {
    return { success: false, message: 'この家は倉庫スペースがありません。家をアップグレードしてください。' }
  }

  const items = await sql<StorageItem[]>`
    SELECT i.id, it.name, it.category, i.quantity, i.durability, i.metadata
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_housing_id = ${housing.id}
    ORDER BY it.category, it.name
  `

  // 実際のスロット数を再カウント
  const countRow = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM items WHERE owner_housing_id = ${housing.id}
  `
  const actualUsed = parseInt(countRow[0]?.count ?? '0')

  // ズレがあれば更新
  if (actualUsed !== housing.slotsUsed) {
    await sql`UPDATE housings SET storage_slots_used = ${actualUsed} WHERE id = ${housing.id}`
  }

  return {
    success: true,
    items,
    slotsUsed: actualUsed,
    slotsMax: housing.slotsMax,
    housingType: housing.housingType,
  }
}

/** インベントリ → 倉庫に預ける */
export async function depositItem(
  characterId: string,
  itemId: string,
  quantity: number = 1
): Promise<{ success: boolean; message?: string }> {
  const housing = await getHousingForCharacter(characterId)
  if (!housing) return { success: false, message: '家を所有していません。' }
  if (housing.slotsMax === 0) return { success: false, message: '倉庫スペースがありません。家をアップグレードしてください。' }

  // アイテム確認
  const item = await sql<{ id: string; quantity: number; name: string; itemTemplateId: string; metadata: any; durability: number | null }[]>`
    SELECT i.id, i.quantity, it.name, i.item_template_id, i.metadata, i.durability
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.id = ${itemId} AND i.owner_character_id = ${characterId}
    LIMIT 1
  `
  if (!item[0]) return { success: false, message: 'アイテムが見つかりません。' }
  if (item[0].quantity < quantity || quantity <= 0) {
    return { success: false, message: '指定した個数がありません。' }
  }

  // 行動中に使用予定のアイテムは預け不可
  const activeAction = await sql<{ id: string }[]>`
    SELECT id FROM action_queue
    WHERE character_id = ${characterId}
      AND status = 'ACTIVE'
      AND parameters->>'itemId' = ${itemId}
    LIMIT 1
  `
  if (activeAction[0]) {
    return { success: false, message: '現在使用中のアイテムは預けられません。' }
  }

  // 装備中のアイテムは預け不可
  const equipped = await sql<{ equippedWeaponId: string | null; equippedArmorId: string | null; equippedAccessoryId: string | null }[]>`
    SELECT equipped_weapon_id, equipped_armor_id, equipped_accessory_id FROM characters WHERE id = ${characterId}
  `
  if (equipped[0]) {
    const eq = equipped[0]
    if (eq.equippedWeaponId === itemId || eq.equippedArmorId === itemId || eq.equippedAccessoryId === itemId) {
      return { success: false, message: '装備中のアイテムは預けられません。先に外してください。' }
    }
  }

  // 倉庫の空きスロット確認（スタック可能アイテムは同名スタックへ合流を試みる）
  const existingStack = await sql<{ id: string; quantity: number }[]>`
    SELECT i.id, i.quantity
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_housing_id = ${housing.id}
      AND i.item_template_id = ${item[0].itemTemplateId}
    LIMIT 1
  `

  await sql.begin(async (tx) => {
    if (existingStack[0]) {
      // 同名アイテムが既にある→スタック合流
      await tx`UPDATE items SET quantity = quantity + ${quantity} WHERE id = ${existingStack[0].id}`
    } else {
      // 新規スロット消費
      const currentSlots = parseInt((await tx<{ count: string }[]>`
        SELECT COUNT(*) as count FROM items WHERE owner_housing_id = ${housing.id}
      `)[0]?.count ?? '0')
      if (currentSlots >= housing.slotsMax) {
        throw new Error('STORAGE_FULL')
      }

      if (item[0].quantity > quantity) {
        // 新アイテム行を倉庫用に作成
        await tx`
          INSERT INTO items (owner_character_id, owner_housing_id, item_template_id, metadata, quantity, durability, quality_internal)
          SELECT NULL, ${housing.id}, item_template_id, metadata, ${quantity}, durability, quality_internal
          FROM items WHERE id = ${itemId}
        `
      } else {
        // 全移動
        await tx`UPDATE items SET owner_character_id = NULL, owner_housing_id = ${housing.id} WHERE id = ${itemId}`
        await tx`UPDATE housings SET storage_slots_used = storage_slots_used + 1 WHERE id = ${housing.id}`
        return
      }
    }

    // インベントリ側を減らす
    if (item[0].quantity > quantity) {
      await tx`UPDATE items SET quantity = quantity - ${quantity} WHERE id = ${itemId}`
    } else {
      await tx`DELETE FROM items WHERE id = ${itemId}`
    }

    // 新規スタック追加の場合はslots_usedを更新
    if (!existingStack[0]) {
      await tx`UPDATE housings SET storage_slots_used = storage_slots_used + 1 WHERE id = ${housing.id}`
    }
  }).catch((e: Error) => {
    if (e.message === 'STORAGE_FULL') {
      throw e
    }
    throw e
  })

  return { success: true, message: `${item[0].name}を${quantity}個、倉庫に預けました。` }
}

/** 倉庫 → インベントリに引き出す */
export async function withdrawItem(
  characterId: string,
  storageItemId: string,
  quantity: number = 1
): Promise<{ success: boolean; message?: string }> {
  const housing = await getHousingForCharacter(characterId)
  if (!housing) return { success: false, message: '家を所有していません。' }

  // 倉庫アイテム確認
  const item = await sql<{ id: string; quantity: number; name: string; itemTemplateId: string; metadata: any; durability: number | null; qualityInternal: number }[]>`
    SELECT i.id, i.quantity, it.name, i.item_template_id, i.metadata, i.durability, i.quality_internal
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.id = ${storageItemId} AND i.owner_housing_id = ${housing.id}
    LIMIT 1
  `
  if (!item[0]) return { success: false, message: '倉庫にそのアイテムが見つかりません。' }
  if (item[0].quantity < quantity || quantity <= 0) {
    return { success: false, message: '指定した個数がありません。' }
  }

  // インベントリ上限確認（50スロット）
  const invCount = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM items WHERE owner_character_id = ${characterId}
  `
  const currentInv = parseInt(invCount[0]?.count ?? '0')

  // インベントリの同名スタックを確認
  const invStack = await sql<{ id: string; quantity: number }[]>`
    SELECT id, quantity FROM items
    WHERE owner_character_id = ${characterId} AND item_template_id = ${item[0].itemTemplateId}
    LIMIT 1
  `
  if (!invStack[0] && currentInv >= 50) {
    return { success: false, message: 'インベントリが満杯です（50スロット上限）。' }
  }

  await sql.begin(async (tx) => {
    if (invStack[0]) {
      // インベントリに同名スタックへ合流
      await tx`UPDATE items SET quantity = quantity + ${quantity} WHERE id = ${invStack[0].id}`
    } else {
      // インベントリに新規スタック
      await tx`
        INSERT INTO items (owner_character_id, owner_housing_id, item_template_id, metadata, quantity, durability, quality_internal)
        VALUES (${characterId}, NULL, ${item[0].itemTemplateId}, ${item[0].metadata}, ${quantity}, ${item[0].durability}, ${item[0].qualityInternal})
      `
    }

    // 倉庫側を減らす
    if (item[0].quantity > quantity) {
      await tx`UPDATE items SET quantity = quantity - ${quantity} WHERE id = ${storageItemId}`
    } else {
      await tx`DELETE FROM items WHERE id = ${storageItemId}`
      await tx`UPDATE housings SET storage_slots_used = GREATEST(0, storage_slots_used - 1) WHERE id = ${housing.id}`
    }
  })

  return { success: true, message: `${item[0].name}を${quantity}個、インベントリに引き出しました。` }
}
