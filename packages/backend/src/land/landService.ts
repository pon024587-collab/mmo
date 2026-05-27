/**
 * 土地・住居システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

/** 土地を購入する */
export async function buyLand(
  characterId: string,
  landId: string
): Promise<{ success: boolean; message?: string }> {
  const land = await sql<{ id: string; status: string; purchasePrice: number; landType: string }[]>`
    SELECT id, status, purchase_price, land_type FROM lands WHERE id = ${landId} LIMIT 1
  `
  if (!land[0]) return { success: false, message: '土地が見つかりません。' }
  if (land[0].status !== 'UNOWNED') return { success: false, message: 'この土地はすでに所有されています。' }

  const char = await sql<{ gold: number }[]>`
    SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0] || char[0].gold < land[0].purchasePrice) {
    return { success: false, message: `所持金が足りません。必要: ${land[0].purchasePrice}G` }
  }

  // 1つの村/都市につき、住宅地は1つしか所有できない
  if (land[0].landType === 'RESIDENTIAL') {
    const existingLand = await sql<{ id: string }[]>`
      SELECT l.id FROM lands l
      WHERE l.owner_character_id = ${characterId} 
        AND l.land_type = 'RESIDENTIAL'
        AND l.village_id = (SELECT village_id FROM lands WHERE id = ${landId})
    `
    if (existingLand.length > 0) {
      return { success: false, message: '各村や都市に住宅地は1つしか所有できません。' }
    }
  }

  await sql.begin(async (tx) => {
    await tx`
      UPDATE characters SET gold = gold - ${land[0]!.purchasePrice}, updated_at = NOW()
      WHERE id = ${characterId}
    `
    await tx`
      UPDATE lands SET owner_character_id = ${characterId}, status = 'OWNED'
      WHERE id = ${landId}
    `
    // 農地の場合は farm_plot を作成
    if (land[0]!.landType === 'FARM') {
      await tx`
        INSERT INTO farm_plots (character_id, land_id)
        VALUES (${characterId}, ${landId})
        ON CONFLICT (character_id) DO NOTHING
      `
    }
  })

  return { success: true, message: '土地を購入しました。' }
}

/** 住居を建てる */
export async function buildHouse(characterId: string, landId: string): Promise<RegisterActionResult> {
  const land = await sql<{ id: string; status: string; ownerCharacterId: string; landType: string }[]>`
    SELECT id, status, owner_character_id, land_type FROM lands WHERE id = ${landId} LIMIT 1
  `
  if (!land[0] || land[0].ownerCharacterId !== characterId) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: 'この土地を所有していません。' }
  }
  if (land[0].landType !== 'RESIDENTIAL') {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '住居用地ではありません。' }
  }

  // 必要素材確認（木材×5、石材×3）
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
  if (parseInt(wood[0]?.count ?? '0') < 5 || parseInt(stone[0]?.count ?? '0') < 3) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '素材が足りません。木材×5、石材×3が必要です。' }
  }

  return registerAction({ characterId, actionType: 'BUILD_HOUSE', parameters: { landId } })
}

/** 住居建設完了時の処理 */
export async function completeBuildHouse(characterId: string, landId: string): Promise<string> {
  const land = await sql<{ villageId: string }[]>`
    SELECT village_id FROM lands WHERE id = ${landId} LIMIT 1
  `
  if (!land[0]) return '住居の建設に失敗しました。'

  // 素材消費（木材×5、石材×3）
  for (let i = 0; i < 5; i++) {
    await sql`
      DELETE FROM items WHERE id = (
        SELECT i.id FROM items i
        JOIN item_templates it ON i.item_template_id = it.id
        WHERE i.owner_character_id = ${characterId} AND it.name = 'WOOD'
        LIMIT 1
      )
    `
  }
  for (let i = 0; i < 3; i++) {
    await sql`
      DELETE FROM items WHERE id = (
        SELECT i.id FROM items i
        JOIN item_templates it ON i.item_template_id = it.id
        WHERE i.owner_character_id = ${characterId} AND it.name = 'STONE'
        LIMIT 1
      )
    `
  }

  // 住居登録
  await sql`
    INSERT INTO housings (character_id, village_id, land_id)
    VALUES (${characterId}, ${land[0].villageId}, ${landId})
    ON CONFLICT DO NOTHING
  `

  // 工作・建築スキルの成長
  await sql`
    UPDATE characters SET skill_crafting_growth = skill_crafting_growth + 15
    WHERE id = ${characterId}
  `

  return '住居が完成した。これで雨風をしのげる場所ができた。'
}

/** 住居情報取得 */
export async function getHousing(characterId: string): Promise<{
  hasHousing: boolean
  storageUsed: number
  storageMax: number
  villageName: string
  housingType?: string
} | null> {
  const rows = await sql<{
    storageSlotsUsed: number
    storageSlotsMax: number
    villageName: string
    housingType: string
  }[]>`
    SELECT h.storage_slots_used, h.storage_slots_max, v.name as village_name, h.housing_type as "housingType"
    FROM housings h
    JOIN villages v ON h.village_id = v.id
    WHERE h.character_id = ${characterId}
    LIMIT 1
  `
  if (!rows[0]) return null
  return {
    hasHousing: true,
    storageUsed: rows[0].storageSlotsUsed,
    storageMax: rows[0].storageSlotsMax,
    villageName: rows[0].villageName,
    housingType: rows[0].housingType,
  }
}

/** 業者に依頼して家をアップグレード（または新築） */
export async function upgradeHouse(
  characterId: string,
  landId: string,
  houseType: 'NORMAL' | 'RICH' | 'MANSION'
): Promise<{ success: boolean; message?: string }> {
  const land = await sql<{ id: string; ownerCharacterId: string; villageId: string }[]>`
    SELECT id, owner_character_id, village_id FROM lands WHERE id = ${landId} LIMIT 1
  `
  if (!land[0] || land[0].ownerCharacterId !== characterId) {
    return { success: false, message: 'この土地を所有していません。' }
  }

  const prices = { NORMAL: 1000, RICH: 3000, MANSION: 10000 }
  const storageMax = { NORMAL: 30, RICH: 50, MANSION: 100 }
  const price = prices[houseType]
  const newStorage = storageMax[houseType]

  const char = await sql<{ gold: number }[]>`SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1`
  if (!char[0] || char[0].gold < price) {
    return { success: false, message: `所持金が足りません。必要: ${price}G` }
  }

  await sql.begin(async (tx) => {
    await tx`UPDATE characters SET gold = gold - ${price}, updated_at = NOW() WHERE id = ${characterId}`
    
    const existing = await tx<{ id: string }[]>`SELECT id FROM housings WHERE land_id = ${landId}`
    if (existing.length > 0) {
      await tx`
        UPDATE housings SET housing_type = ${houseType}, storage_slots_max = ${newStorage}
        WHERE land_id = ${landId}
      `
    } else {
      await tx`
        INSERT INTO housings (character_id, village_id, land_id, housing_type, storage_slots_max)
        VALUES (${characterId}, ${land[0]!.villageId}, ${landId}, ${houseType}, ${newStorage})
      `
    }
  })

  const names = { NORMAL: '普通の家', RICH: 'リッチな家', MANSION: '屋敷' }
  return { success: true, message: `${names[houseType]}の建設が完了しました！` }
}

/** 土地や家を手放す（購入額の50%が返還される） */
export async function sellLand(
  characterId: string,
  landId: string
): Promise<{ success: boolean; message?: string }> {
  const land = await sql<{ id: string; ownerCharacterId: string; purchasePrice: number }[]>`
    SELECT id, owner_character_id, purchase_price FROM lands WHERE id = ${landId} LIMIT 1
  `
  if (!land[0] || land[0].ownerCharacterId !== characterId) {
    return { success: false, message: 'この土地を所有していません。' }
  }

  // ハウジングにアイテムが残っているか確認
  const storageItems = await sql<{ count: number }[]>`
    SELECT COUNT(*)::INTEGER as count FROM items WHERE owner_housing_id = (
      SELECT id FROM housings WHERE land_id = ${landId} LIMIT 1
    )
  `
  if (storageItems[0] && storageItems[0].count > 0) {
    return { success: false, message: '倉庫にアイテムが残っているため、手放せません。' }
  }

  const refund = Math.floor(land[0].purchasePrice * 0.5)

  await sql.begin(async (tx) => {
    // 関連データを削除
    await tx`DELETE FROM housings WHERE land_id = ${landId}`
    await tx`DELETE FROM farm_plots WHERE land_id = ${landId}`
    // 土地を未所有に戻す
    await tx`
      UPDATE lands SET owner_character_id = NULL, status = 'UNOWNED'
      WHERE id = ${landId}
    `
    // お金を返還
    await tx`
      UPDATE characters SET gold = gold + ${refund}, updated_at = NOW()
      WHERE id = ${characterId}
    `
  })

  return { success: true, message: `土地を手放し、${refund}Gを受け取りました。` }
}
