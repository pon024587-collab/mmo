/**
 * 人生記録・墓システム
 */
import { sql } from '../db/client.js'
import { executeWill } from '../social/willService.js'

/** キャラクター死亡処理 */
export async function processCharacterDeath(
  characterId: string,
  causeOfDeath: string
): Promise<void> {
  const char = await sql<{
    playerId: string
    name: string
    age: number
    nationId: string
    villageId: string
    createdAt: Date
    gold: number
  }[]>`
    SELECT player_id, name, age, nation_id, village_id, created_at, gold
    FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return

  const now = new Date()
  const birthYear = Math.floor(char[0].age - (now.getTime() - char[0].createdAt.getTime()) / (365 * 60 * 60 * 1000))

  await sql.begin(async (tx) => {
    // キャラクターをINACTIVE状態に
    await tx`
      UPDATE characters SET status = 'INACTIVE', updated_at = NOW() WHERE id = ${characterId}
    `

    // Life_Record生成
    await tx`
      INSERT INTO life_records (
        player_id, character_name, birth_date, death_date,
        final_age, cause_of_death, total_gold_earned
      ) VALUES (
        ${char[0]!.playerId}, ${char[0]!.name}, ${char[0]!.createdAt}, ${now},
        ${char[0]!.age}, ${causeOfDeath}, ${char[0]!.gold}
      )
    `

    // 墓を設置
    await tx`
      INSERT INTO graves (
        character_id, village_id, character_name,
        birth_year, death_year, cause_of_death
      ) VALUES (
        ${characterId}, ${char[0]!.villageId}, ${char[0]!.name},
        ${birthYear}, ${char[0]!.age}, ${causeOfDeath}
      )
    `
  })

  // 遺言執行
  await executeWill(characterId)
}

/** 人生記録一覧を取得 */
export async function getLifeRecords(playerId: string): Promise<{
  id: string
  characterName: string
  finalAge: number
  causeOfDeath: string
  deathDate: Date
}[]> {
  return sql`
    SELECT id, character_name, final_age, cause_of_death, death_date
    FROM life_records WHERE player_id = ${playerId}
    ORDER BY death_date DESC
  `
}

/** 墓を参拝する */
export async function visitGrave(
  characterId: string,
  graveId: string
): Promise<{ text: string }> {
  const grave = await sql<{
    characterName: string
    birthYear: number
    deathYear: number
    causeOfDeath: string
    epitaph: string | null
  }[]>`
    SELECT character_name, birth_year, death_year, cause_of_death, epitaph
    FROM graves WHERE id = ${graveId} LIMIT 1
  `
  if (!grave[0]) return { text: '墓が見つかりません。' }

  const g = grave[0]

  // Faith微増
  await sql`
    UPDATE characters SET faith = LEAST(100, faith + 1), updated_at = NOW()
    WHERE id = ${characterId}
  `

  // 自分の前世の墓かチェック
  const prevChar = await sql<{ name: string }[]>`
    SELECT c.name FROM characters c
    JOIN life_records lr ON lr.character_name = c.name
    JOIN players p ON p.id = lr.player_id
    JOIN characters cur ON cur.player_id = p.id
    WHERE cur.id = ${characterId} AND c.name = ${g.characterName}
    LIMIT 1
  `

  const baseText = `墓碑銘: ${g.characterName}（${g.birthYear}〜${g.deathYear}歳）\n死因: ${g.causeOfDeath}`
  const epitaphText = g.epitaph ? `\n「${g.epitaph}」` : ''

  if (prevChar[0]) {
    return { text: `${baseText}${epitaphText}\n\n…見覚えのある名前が刻まれている。` }
  }

  return { text: `${baseText}${epitaphText}` }
}
