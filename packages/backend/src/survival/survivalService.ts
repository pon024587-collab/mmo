/**
 * 生存システム
 * Hunger・Thirst・Fatigue・Body_Temperature・Stress の管理
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

/** 生存状態テキストを取得 */
export async function getSurvivalStatus(characterId: string): Promise<{
  hungerText: string
  thirstText: string
  fatigueText: string
  stressText: string
  tempText: string
}> {
  const rows = await sql<{
    hungerInternal: number
    thirstInternal: number
    fatigueInternal: number
    stressInternal: number
    bodyTempInternal: number
  }[]>`
    SELECT hunger_internal, thirst_internal, fatigue_internal, stress_internal, body_temp_internal
    FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!rows[0]) return { hungerText: '', thirstText: '', fatigueText: '', stressText: '', tempText: '' }
  const c = rows[0]

  return {
    hungerText:  toHungerText(c.hungerInternal),
    thirstText:  toThirstText(c.thirstInternal),
    fatigueText: toFatigueText(c.fatigueInternal),
    stressText:  toStressText(c.stressInternal),
    tempText:    toTempText(c.bodyTempInternal),
  }
}

/** 食事行動 */
export async function eat(characterId: string, foodItemId: string): Promise<RegisterActionResult> {
  const item = await sql<{ id: string; itemTemplateId: string }[]>`
    SELECT id, item_template_id FROM items
    WHERE id = ${foodItemId} AND owner_character_id = ${characterId} LIMIT 1
  `
  if (!item[0]) return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '食料がありません。' }

  return registerAction({ characterId, actionType: 'EAT', parameters: { itemId: foodItemId } })
}

/** 飲水行動 */
export async function drink(characterId: string, hasWaterSource: boolean, itemId?: string): Promise<RegisterActionResult> {
  let consumeItemId = itemId
  if (!consumeItemId && !hasWaterSource) {
    // 水Itemが必要
    const waterItem = await sql<{ id: string; quantity: number }[]>`
      SELECT i.id, i.quantity FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.owner_character_id = ${characterId} AND (it.name = 'WATER' OR it.name = '水') LIMIT 1
    `
    if (!waterItem[0]) {
      return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '近くに水源がなく、水も持っていません。' }
    }
    consumeItemId = waterItem[0].id
    // 行動開始時にアイテムを消費する
    if (waterItem[0].quantity > 1) {
      await sql`UPDATE items SET quantity = quantity - 1 WHERE id = ${consumeItemId}`
    } else {
      await sql`DELETE FROM items WHERE id = ${consumeItemId}`
    }
  }
  return registerAction({ characterId, actionType: 'DRINK', parameters: consumeItemId ? { itemId: consumeItemId } : undefined })
}

/** 睡眠行動 */
export async function sleep(characterId: string): Promise<RegisterActionResult> {
  return registerAction({ characterId, actionType: 'SLEEP', durationOverrideMinutes: 420 })
}

/** 仮眠行動 */
export async function nap(characterId: string): Promise<RegisterActionResult> {
  return registerAction({ characterId, actionType: 'NAP', durationOverrideMinutes: 90 })
}

/** 焚き火行動 */
export async function makeCampfire(characterId: string): Promise<RegisterActionResult> {
  const fuel = await sql<{ id: string }[]>`
    SELECT i.id FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId} AND it.name = 'FUEL' LIMIT 1
  `
  if (!fuel[0]) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '燃料がありません。' }
  }
  return registerAction({ characterId, actionType: 'CAMPFIRE' })
}

/** 食事完了時の処理 */
export async function completeEat(characterId: string, itemId: string): Promise<string> {
  const item = await sql<{ itemTemplateId: string }[]>`
    SELECT item_template_id FROM items WHERE id = ${itemId} LIMIT 1
  `
  if (!item[0]) return '食事できませんでした。'

  const template = await sql<{ name: string; category: string }[]>`
    SELECT name, category FROM item_templates WHERE id = ${item[0].itemTemplateId} LIMIT 1
  `
  const t = template[0]
  const name = t?.name ?? ''

  // アイテム消費（スタック対応: 1個だけ消費）
  const itemRow = await sql<{ quantity: number }[]>`SELECT quantity FROM items WHERE id = ${itemId}`
  if (!itemRow[0]) return '食事できませんでした。'
  if (itemRow[0].quantity > 1) {
    await sql`UPDATE items SET quantity = quantity - 1 WHERE id = ${itemId}`
  } else {
    await sql`DELETE FROM items WHERE id = ${itemId}`
  }

  // --- 料理済み専用アイテム ---
  if (name === '焼きたてのパン') {
    await sql`
      UPDATE characters
      SET hunger_internal = LEAST(100, hunger_internal + 40),
          updated_at = NOW()
      WHERE id = ${characterId}
    `
    return '焼きたてのパンを食べた。温かくて美味しい。空腹がかなり癒えた。'
  }
  if (name === '肉シチュー') {
    await sql`
      UPDATE characters
      SET hunger_internal = LEAST(100, hunger_internal + 60),
          health = LEAST(health_max, health + 15),
          updated_at = NOW()
      WHERE id = ${characterId}
    `
    return '肉シチューを食べた。栄養満点で体が温まった。空腹が完全に癒え、傷も少し回復した。'
  }
  if (name === '薬草茶') {
    await sql`
      UPDATE characters
      SET thirst_internal = LEAST(100, thirst_internal + 40),
          stress_internal = GREATEST(0, stress_internal - 20),
          updated_at = NOW()
      WHERE id = ${characterId}
    `
    return '薬草茶を飲んだ。ほんのり苦くて心地よい香り。喉の渇きが癒え、気分が楽になった。'
  }

  // --- 生素材（生の肉・パンなど）---
  const hungerRestore = (name === 'MEAT' || name === '肉') ? 20
    : (name === 'BREAD' || name === 'パン') ? 15
    : 10

  await sql`
    UPDATE characters
    SET hunger_internal = LEAST(100, hunger_internal + ${hungerRestore}),
        updated_at = NOW()
    WHERE id = ${characterId}
  `
  return (name === 'MEAT' || name === '肉')
    ? '生の肉を食べた。調理すればもっと効果があるのに…'
    : (name === 'BREAD' || name === 'パン')
    ? 'パンをかじった。固くて味気ない。'
    : '食事をとった。'
}

/** 飲水完了時の処理 */
export async function completeDrink(characterId: string, itemId?: string): Promise<string> {
  // アイテムは drink() の行動開始時に消費済み。ここでは渇き回復のみ行う。
  await sql`
    UPDATE characters
    SET thirst_internal = LEAST(100, thirst_internal + 50),
        updated_at = NOW()
    WHERE id = ${characterId}
  `

  return itemId ? '水筒の水を飲んだ。喉の渇きが癒えた。' : '水を飲んだ。喉の渇きが癒えた。'
}

/** 睡眠完了時の処理 */
export async function completeSleep(characterId: string): Promise<string> {
  await sql`
    UPDATE characters
    SET fatigue_internal = GREATEST(0, fatigue_internal - 80),
        health = LEAST(health_max, health + 10),
        mp = LEAST(mp_max, mp + 30),
        updated_at = NOW()
    WHERE id = ${characterId}
  `

  // Dream判定（30%の確率）
  const hasDream = Math.random() < 0.3
  if (hasDream) {
    return 'ぐっすりと眠った。夢を見た気がする…不思議な光景が頭に残っている。'
  }
  return 'ぐっすりと眠った。体が回復した。'
}

/** World_Tickでの体温更新 */
export async function updateBodyTemperature(
  characterId: string,
  weather: string,
  season: string,
  hasWarmClothing: boolean
): Promise<void> {
  let tempChange = 0

  if ((weather === 'SNOW' || season === 'WINTER') && !hasWarmClothing) {
    tempChange = -2 // 体温低下
  } else if (season === 'SUMMER' && (weather === 'CLEAR')) {
    tempChange = +1 // 体温上昇
  }

  if (tempChange !== 0) {
    await sql`
      UPDATE characters
      SET body_temp_internal = LEAST(42, GREATEST(32, body_temp_internal + ${tempChange})),
          updated_at = NOW()
      WHERE id = ${characterId}
    `
    // 体温が危険域なら体力減少
    await sql`
      UPDATE characters
      SET health = GREATEST(0, health - 3)
      WHERE id = ${characterId}
        AND (body_temp_internal <= 34 OR body_temp_internal >= 40)
    `
  }
}

// --- テキスト変換 ---

function toHungerText(v: number): string {
  if (v >= 80) return '満腹だ'
  if (v >= 60) return '少し空腹だ'
  if (v >= 40) return 'かなり腹が減っている'
  if (v >= 20) return '空腹で力が出ない'
  return '限界に近い。何か食べなければ'
}

function toThirstText(v: number): string {
  if (v >= 80) return '喉は潤っている'
  if (v >= 60) return '少し喉が渇いている'
  if (v >= 40) return 'かなり喉が渇いている'
  if (v >= 20) return '口が乾いてめまいがする'
  return '脱水状態に近い。水が必要だ'
}

function toFatigueText(v: number): string {
  if (v <= 20) return '元気だ'
  if (v <= 40) return '少し疲れている'
  if (v <= 60) return 'かなり疲弊している'
  if (v <= 80) return '体が重い。休みたい'
  return '限界だ。今すぐ休まなければ'
}

function toStressText(v: number): string {
  if (v <= 20) return '心は穏やかだ'
  if (v <= 40) return '少し気が滅入っている'
  if (v <= 60) return '心が疲弊している'
  if (v <= 80) return '精神的に追い詰められている'
  return '精神的に限界だ'
}

function toTempText(v: number): string {
  if (v <= 34) return '凍えそうだ。暖を取らなければ'
  if (v <= 36) return '肌寒い'
  if (v <= 38) return '体温は正常だ'
  if (v <= 39) return '少し暑い'
  return '汗が止まらない。熱中症に注意'
}
