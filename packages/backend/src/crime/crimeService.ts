/**
 * 犯罪・法律システム
 */
import { sql } from '../db/client.js'

export type CrimeType = 'THEFT' | 'ASSAULT' | 'TRESPASSING' | 'TAX_EVASION'

/** 犯罪を記録する */
export async function recordCrime(
  characterId: string,
  nationId: string,
  crimeType: CrimeType,
  severity: number = 1
): Promise<void> {
  await sql`
    INSERT INTO crime_records (character_id, nation_id, crime_type, severity)
    VALUES (${characterId}, ${nationId}, ${crimeType}, ${severity})
  `
  // 村の治安レベルを低下
  await sql`
    UPDATE villages v
    SET security_level = GREATEST(0, security_level - ${severity * 5})
    FROM characters c
    WHERE c.id = ${characterId} AND c.village_id = v.id
  `
}

/** 犯罪記録の重さを確認し、逮捕判定 */
export async function checkArrest(characterId: string, nationId: string): Promise<{
  shouldArrest: boolean
  totalSeverity: number
}> {
  const rows = await sql<{ totalSeverity: number }[]>`
    SELECT COALESCE(SUM(severity), 0) as total_severity
    FROM crime_records
    WHERE character_id = ${characterId} AND nation_id = ${nationId}
  `
  const total = rows[0]?.totalSeverity ?? 0
  return { shouldArrest: total >= 10, totalSeverity: total }
}

/** 逮捕・投獄処理 */
export async function arrest(
  characterId: string,
  nationId: string
): Promise<{ imprisonmentMinutes: number; goldFine: number; resultText: string }> {
  const { totalSeverity } = await checkArrest(characterId, nationId)

  // 重さに応じた罰則
  const imprisonmentMinutes = Math.min(totalSeverity * 60, 24 * 60) // 最大24時間
  const goldFine = totalSeverity * 20

  // 所持金から罰金を差し引く
  await sql`
    UPDATE characters
    SET gold = GREATEST(0, gold - ${goldFine}),
        is_imprisoned = true,
        updated_at = NOW()
    WHERE id = ${characterId}
  `

  // 犯罪記録をリセット
  await sql`
    DELETE FROM crime_records WHERE character_id = ${characterId} AND nation_id = ${nationId}
  `

  return {
    imprisonmentMinutes,
    goldFine,
    resultText: `騎士に捕まった。罰金${goldFine}Gを徴収され、牢に入れられた。`,
  }
}

/** 投獄状態を解除する */
export async function releaseFromPrison(characterId: string): Promise<void> {
  await sql`
    UPDATE characters SET is_imprisoned = false, updated_at = NOW()
    WHERE id = ${characterId}
  `
}
