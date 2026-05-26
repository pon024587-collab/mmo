/**
 * 税金・借金システム
 */
import { sql } from '../db/client.js'

/** 税金を徴収する（World_Tickで168時間ごとに呼び出す） */
export async function collectTaxes(): Promise<void> {
  const chars = await sql<{
    id: string
    gold: number
    nationId: string
    taxRate: number
  }[]>`
    SELECT c.id, c.gold, c.nation_id, n.tax_rate
    FROM characters c
    JOIN nations n ON c.nation_id = n.id
    WHERE c.status != 'INACTIVE'
  `

  for (const char of chars) {
    const taxAmount = Math.floor(char.gold * (char.taxRate / 100))
    if (taxAmount <= 0) continue

    if (char.gold >= taxAmount) {
      await sql`
        UPDATE characters SET gold = gold - ${taxAmount}, updated_at = NOW()
        WHERE id = ${char.id}
      `
    } else {
      // 所持金不足 → 負債として記録
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
