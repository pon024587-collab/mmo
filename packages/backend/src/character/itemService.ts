import { sql } from '../db/client.js'

/**
 * キャラクターにアイテムを付与する（スタック対応）
 * @param characterId キャラクターID
 * @param templateId アイテムテンプレートID
 * @param quantity 個数
 * @param metadata メタデータ（空ならスタックを試みる）
 * @param qualityInternal 品質（デフォルト50、特殊な場合はスタックしない）
 * @param tx トランザクションオブジェクト（オプション）
 */
export async function giveItem(
  characterId: string,
  templateId: string,
  quantity: number = 1,
  metadata: any = {},
  qualityInternal: number = 50,
  tx: any = sql
): Promise<void> {
  const isStackable = Object.keys(metadata).length === 0 && qualityInternal === 50

  if (isStackable) {
    const existing = await tx<{ id: string }[]>`
      SELECT id FROM items 
      WHERE owner_character_id = ${characterId} 
        AND item_template_id = ${templateId} 
        AND metadata = '{}'::jsonb 
        AND quality_internal = 50 
        AND durability IS NULL
      LIMIT 1
    `
    if (existing[0]) {
      await tx`
        UPDATE items 
        SET quantity = quantity + ${quantity} 
        WHERE id = ${existing[0].id}
      `
      return
    }
  }

  await tx`
    INSERT INTO items (owner_character_id, item_template_id, quantity, metadata, quality_internal)
    VALUES (${characterId}, ${templateId}, ${quantity}, ${metadata}, ${qualityInternal})
  `
}
