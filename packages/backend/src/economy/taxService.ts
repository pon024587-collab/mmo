/**
 * 税金・借金システム
 */
import { sql } from '../db/client.js'
import { addBounty } from '../pvp/pvpService.js'

/** 税金を徴収する（World_Tickで168時間ごとに呼び出す） */
export async function collectTaxes(): Promise<void> {
  const chars = await sql<{
    id: string
    gold: number
    nationId: string
    taxRate: number
    landCount: number
  }[]>`
    SELECT 
      c.id, 
      c.gold, 
      c.nation_id, 
      n.tax_rate,
      (SELECT COUNT(*)::INTEGER FROM lands l WHERE l.owner_character_id = c.id) as land_count
    FROM characters c
    JOIN nations n ON c.nation_id = n.id
    WHERE c.status != 'INACTIVE'
  `

  for (const char of chars) {
    // 基礎税（所持金の割合） + 固定資産税（土地1つにつき200G）
    const baseTax = Math.floor(char.gold * (char.taxRate / 100))
    const propertyTax = char.landCount * 200
    const taxAmount = baseTax + propertyTax

    if (taxAmount <= 0) continue

    if (char.gold >= taxAmount) {
      await sql`
        UPDATE characters SET gold = gold - ${taxAmount}, updated_at = NOW()
        WHERE id = ${char.id}
      `
    } else {
      // 所持金不足 → 負債として記録し、賞金首（脱税）にする
      const shortage = taxAmount - char.gold
      await sql`
        UPDATE characters SET gold = 0, updated_at = NOW() WHERE id = ${char.id}
      `
      await sql`
        INSERT INTO tax_debts (character_id, nation_id, amount)
        VALUES (${char.id}, ${char.nationId}, ${shortage})
        ON CONFLICT (character_id, nation_id)
        DO UPDATE SET amount = tax_debts.amount + ${shortage}
      `
      
      // 脱税による賞金首化（最低50G）
      await addBounty(char.id, Math.max(50, shortage), '脱税')
    }
  }
}

/** 借金の利息を加算する（World_Tickで168時間ごとに呼び出す） */
export async function applyDebtInterest(): Promise<void> {
  await sql`
    UPDATE debts
    SET current_balance = CEIL(current_balance * (1 + interest_rate / 100.0)),
        last_interest_applied_at = NOW()
    WHERE last_interest_applied_at < NOW() - INTERVAL '168 hours'
  `
}

/** 借金を返済する */
export async function repayDebt(
  characterId: string,
  debtId: string,
  amount: number
): Promise<{ success: boolean; message?: string }> {
  const debt = await sql<{ id: string; currentBalance: number }[]>`
    SELECT id, current_balance FROM debts
    WHERE id = ${debtId} AND character_id = ${characterId} LIMIT 1
  `
  if (!debt[0]) return { success: false, message: '借金が見つかりません。' }

  const char = await sql<{ gold: number }[]>`
    SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0] || char[0].gold < amount) {
    return { success: false, message: '所持金が足りません。' }
  }

  const repay = Math.min(amount, debt[0].currentBalance)
  await sql.begin(async (tx) => {
    await tx`UPDATE characters SET gold = gold - ${repay}, updated_at = NOW() WHERE id = ${characterId}`
    if (repay >= debt[0]!.currentBalance) {
      await tx`DELETE FROM debts WHERE id = ${debtId}`
    } else {
      await tx`UPDATE debts SET current_balance = current_balance - ${repay} WHERE id = ${debtId}`
    }
  })

  return { success: true, message: `${repay}Gを返済しました。` }
}

/** 税金の滞納を返済する */
export async function repayTaxDebt(
  characterId: string,
  amount: number
): Promise<{ success: boolean; message?: string }> {
  const taxDebt = await sql<{ amount: number; nationId: string }[]>`
    SELECT amount, nation_id FROM tax_debts
    WHERE character_id = ${characterId} LIMIT 1
  `
  if (!taxDebt[0] || taxDebt[0].amount <= 0) return { success: false, message: '滞納している税金はありません。' }

  const char = await sql<{ gold: number }[]>`
    SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0] || char[0].gold < amount) {
    return { success: false, message: '所持金が足りません。' }
  }

  const repay = Math.min(amount, taxDebt[0].amount)
  await sql.begin(async (tx) => {
    await tx`UPDATE characters SET gold = gold - ${repay}, updated_at = NOW() WHERE id = ${characterId}`
    if (repay >= taxDebt[0].amount) {
      await tx`DELETE FROM tax_debts WHERE character_id = ${characterId} AND nation_id = ${taxDebt[0].nationId}`
    } else {
      await tx`UPDATE tax_debts SET amount = amount - ${repay} WHERE character_id = ${characterId} AND nation_id = ${taxDebt[0].nationId}`
    }
  })

  return { success: true, message: `未納だった税金 ${repay}G を納めました。` }
}
