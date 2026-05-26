/**
 * 遺言・相続システム
 */
import { sql } from '../db/client.js'

export interface Beneficiary {
  type: 'CHARACTER' | 'NPC' | 'VILLAGE'
  id: string
  goldAmount?: number
  itemIds?: string[]
}

/** 遺言を作成・更新する */
export async function createWill(
  characterId: string,
  beneficiaries: Beneficiary[]
): Promise<{ success: boolean; message?: string }> {
  await sql`
    INSERT INTO wills (character_id, beneficiaries)
    VALUES (${characterId}, ${JSON.stringify(beneficiaries)})
    ON CONFLICT (character_id)
    DO UPDATE SET beneficiaries = ${JSON.stringify(beneficiaries)}, updated_at = NOW()
    WHERE wills.is_active = true
  `
  return { success: true, message: '遺言を作成しました。' }
}

/** 死亡時に遺言を執行する */
export async function executeWill(characterId: string): Promise<void> {
  const will = await sql<{ beneficiaries: Beneficiary[] }[]>`
    SELECT beneficiaries FROM wills WHERE character_id = ${characterId} AND is_active = true LIMIT 1
  `

  const char = await sql<{ gold: number; villageId: string }[]>`
    SELECT gold, village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return

  if (!will[0]) {
    // 遺言なし → 所持金の50%をVillageの共有資金に
    const halfGold = Math.floor(char[0].gold / 2)
    await sql`
      UPDATE villages SET food_stock = food_stock + ${halfGold}
      WHERE id = ${char[0].villageId}
    `
    return
  }

  // 遺言に従って財産を移転
  for (const b of will[0].beneficiaries) {
    if (b.goldAmount && b.type === 'CHARACTER') {
      await sql`
        UPDATE characters SET gold = gold + ${b.goldAmount}, updated_at = NOW()
        WHERE id = ${b.id}
      `
    }
  }

  // 遺言を無効化
  await sql`UPDATE wills SET is_active = false WHERE character_id = ${characterId}`
}
