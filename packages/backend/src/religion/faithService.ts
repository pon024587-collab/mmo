/**
 * 宗教・信仰システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

export type DeityType = 'HARVEST' | 'WAR' | 'HEALING' | 'WISDOM' | 'NATURE'

const DEITY_NAMES: Record<DeityType, string> = {
  HARVEST: '豊穣の女神',
  WAR:     '戦の神',
  HEALING: '癒しの神',
  WISDOM:  '知恵の神',
  NATURE:  '自然の精霊',
}

/** 神殿に参拝する */
export async function pray(characterId: string, deityType: DeityType): Promise<RegisterActionResult> {
  return registerAction({ characterId, actionType: 'PRAY', parameters: { deityType } })
}

/** 参拝完了時の処理 */
export async function completePray(characterId: string, deityType: DeityType): Promise<string> {
  const char = await sql<{ faith: number; stressInternal: number }[]>`
    SELECT faith, stress_internal FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return '参拝できませんでした。'

  // Faith増加・Stress減少
  await sql`
    UPDATE characters
    SET faith = LEAST(100, faith + 5),
        stress_internal = GREATEST(0, stress_internal - 10),
        updated_at = NOW()
    WHERE id = ${characterId}
  `

  const newFaith = char[0].faith + 5
  const deityName = DEITY_NAMES[deityType]

  // Faith閾値に応じた恩恵テキスト
  if (newFaith >= 80) {
    return `${deityName}への深い信仰が心に宿っている。祈りを捧げると、温かい光に包まれた気がした。`
  } else if (newFaith >= 50) {
    return `${deityName}に祈りを捧げた。神官が「あなたの信仰は本物だ」と言った。`
  } else {
    return `${deityName}の神殿で祈りを捧げた。心が少し落ち着いた。`
  }
}

/** Faith恩恵を内部計算に適用する */
export function getFaithBonus(faith: number, deityType: DeityType): number {
  if (faith < 50) return 0
  // 恩恵は内部計算のみ（プレイヤーに数値非表示）
  const base = Math.floor((faith - 50) / 10)
  return Math.min(base, 5) // 最大+5%ボーナス
}
