/**
 * 農業システム
 * 耕す→種まき→水やり→収穫の順序制約と収穫量計算
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'
import { giveItem } from '../character/itemService.js'

export type CropType = 'POTATO' | 'WHEAT' | 'CARROT' | 'CABBAGE' | 'HERB'
export type FarmStep = 'PLOWED' | 'SOWED' | 'WATERED' | 'READY_HARVEST'

/** 作物ごとの適正季節 */
const CROP_SEASONS: Record<CropType, string[]> = {
  POTATO:  ['SPRING', 'AUTUMN'],
  WHEAT:   ['SPRING', 'SUMMER'],
  CARROT:  ['SPRING', 'AUTUMN'],
  CABBAGE: ['AUTUMN', 'WINTER'],
  HERB:    ['SPRING', 'SUMMER', 'AUTUMN'],
}

/** 作物ごとの必要水やり回数 */
const CROP_WATER_NEEDED: Record<CropType, number> = {
  POTATO: 3,
  WHEAT:  4,
  CARROT: 3,
  CABBAGE: 2,
  HERB:   2,
}

export interface FarmPlot {
  id: string
  characterId: string
  step: FarmStep | 'EMPTY'
  cropType: CropType | null
  waterCount: number
  plantedSeason: string | null
  plantedAt: Date | null
}

/** 農地の現在状態を取得 */
export async function getFarmPlot(characterId: string): Promise<FarmPlot | null> {
  const rows = await sql<FarmPlot[]>`
    SELECT * FROM farm_plots WHERE character_id = ${characterId} LIMIT 1
  `
  return rows[0] ?? null
}

/** 畑を耕す */
export async function startPlow(characterId: string): Promise<RegisterActionResult> {
  const plot = await getFarmPlot(characterId)
  if (!plot) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '農地を所有または借用していません。' }
  }
  if (plot.step !== 'EMPTY') {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '畑はすでに使用中です。収穫してから耕してください。' }
  }
  return registerAction({ characterId, actionType: 'FARM_PLOW' })
}

/** 種をまく */
export async function startSow(characterId: string, cropType: CropType): Promise<RegisterActionResult> {
  const plot = await getFarmPlot(characterId)
  if (!plot || plot.step !== 'PLOWED') {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '先に畑を耕してください。' }
  }
  return registerAction({ characterId, actionType: 'FARM_SOW', parameters: { cropType } })
}

/** 水やり */
export async function startWater(characterId: string): Promise<RegisterActionResult> {
  const plot = await getFarmPlot(characterId)
  if (!plot || plot.step !== 'SOWED') {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '先に種をまいてください。' }
  }
  return registerAction({ characterId, actionType: 'FARM_WATER' })
}

/** 収穫 */
export async function startHarvest(characterId: string): Promise<RegisterActionResult> {
  const plot = await getFarmPlot(characterId)
  if (!plot || plot.step !== 'READY_HARVEST') {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: 'まだ収穫できません。水やりを続けてください。' }
  }
  return registerAction({ characterId, actionType: 'FARM_HARVEST' })
}

/** 畑を耕し終わった時の処理 */
export async function completeFarmPlow(characterId: string): Promise<string> {
  await sql`
    INSERT INTO farm_plots (character_id, step) VALUES (${characterId}, 'PLOWED')
    ON CONFLICT (character_id) DO UPDATE SET step = 'PLOWED'
  `
  return '荒れた土地を耕し、種をまく準備が整った。'
}

/** 種まき完了時の処理 */
export async function completeFarmSow(characterId: string, cropType: string): Promise<string> {
  const plot = await getFarmPlot(characterId)
  if (!plot || plot.step !== 'PLOWED') return '種をまけませんでした。'

  // 現在の季節を取得（簡易的に春固定としているが、適宜拡張可能）
  const plantedSeason = 'SPRING'

  await sql`
    UPDATE farm_plots
    SET step = 'SOWED', crop_type = ${cropType}, planted_season = ${plantedSeason}, planted_at = NOW()
    WHERE character_id = ${characterId}
  `
  return `畑に種（${cropType}）をまいた。`
}

/** 水やり完了時の処理 */
export async function completeFarmWater(characterId: string): Promise<string> {
  const plot = await getFarmPlot(characterId)
  if (!plot || plot.step !== 'SOWED') return '水やりができませんでした。'

  const requiredWater = CROP_WATER_NEEDED[plot.cropType as CropType] ?? 3
  const nextWater = plot.waterCount + 1

  if (nextWater >= requiredWater) {
    await sql`
      UPDATE farm_plots
      SET step = 'READY_HARVEST', water_count = ${nextWater}
      WHERE character_id = ${characterId}
    `
    return 'たっぷりと水をやった。作物は収穫の時を待っている。'
  } else {
    await sql`
      UPDATE farm_plots
      SET water_count = ${nextWater}
      WHERE character_id = ${characterId}
    `
    return '畑に水をやった。'
  }
}

/** 収穫完了時の処理 */
export async function completeFarmHarvest(characterId: string): Promise<string> {
  const plot = await getFarmPlot(characterId)
  if (!plot || !plot.cropType) return '収穫できるものがありませんでした。'

  const char = await sql<{ skillFarmingGrowth: number; fatigueInternal: number; villageId: string }[]>`
    SELECT skill_farming_growth, fatigue_internal, village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return '収穫できませんでした。'

  const village = await sql<{ currentWeather: string }[]>`
    SELECT current_weather FROM villages WHERE id = ${char[0].villageId} LIMIT 1
  `
  const weather = village[0]?.currentWeather ?? 'CLEAR'

  // 疲労ペナルティ（疲労100で全効果が半減）
  const fatigue = Math.max(0, Math.min(100, char[0].fatigueInternal))
  const fatigueMultiplier = 1.0 - (fatigue * 0.5 / 100)

  // 収穫量計算（内部）
  const base = 10
  const seasonBonus = (CROP_SEASONS[plot.cropType] ?? []).includes(plot.plantedSeason ?? '') ? 1.0 : 0.5
  const waterBonus = Math.min(plot.waterCount / (CROP_WATER_NEEDED[plot.cropType] ?? 3), 1.2)
  const weatherPenalty = weather === 'STORM' ? 0.7 : 1.0
  const skillBonus = (1 + (char[0].skillFarmingGrowth / 1000)) * fatigueMultiplier
  const amount = Math.floor(base * seasonBonus * waterBonus * weatherPenalty * skillBonus)

  // アイテムをインベントリに追加
  const templateId = await getCropTemplateId(plot.cropType)
  if (templateId) {
    await giveItem(characterId, templateId, amount, {})
  }

  // 農地をリセット
  await sql`
    UPDATE farm_plots
    SET step = 'EMPTY', crop_type = NULL, water_count = 0, planted_season = NULL, planted_at = NULL
    WHERE character_id = ${characterId}
  `

  // Skill_Growth蓄積
  await sql`
    UPDATE characters
    SET skill_farming_growth = skill_farming_growth + ${Math.floor(Math.random() * 3) + 1}
    WHERE id = ${characterId}
  `

  // テキスト生成（数値非表示）
  return generateHarvestText(char[0].skillFarmingGrowth, amount, base)
}

function generateHarvestText(skillGrowth: number, amount: number, base: number): string {
  const ratio = amount / base
  if (skillGrowth < 50) {
    if (ratio >= 1.2) return 'なんとか収穫できた。思ったより実りがあった。'
    if (ratio >= 0.8) return 'ぎこちない手つきで収穫した。まずまずの出来だ。'
    return '収穫したが、あまり実りがなかった。'
  } else if (skillGrowth < 200) {
    if (ratio >= 1.2) return '慣れた手つきで収穫した。今年は豊作だ。'
    if (ratio >= 0.8) return '丁寧に収穫した。悪くない出来だ。'
    return '収穫した。天気が悪かったせいか、少し物足りない出来だった。'
  } else {
    if (ratio >= 1.2) return '土の状態を見極めながら丁寧に収穫した。素晴らしい豊作だ。'
    if (ratio >= 0.8) return '経験を活かして効率よく収穫した。去年より実りが良かった。'
    return '収穫した。条件が悪かったが、経験でカバーできた。'
  }
}

async function getCropTemplateId(cropType: CropType): Promise<string | null> {
  const nameMap: Record<CropType, string> = {
    POTATO: 'ジャガイモ',
    WHEAT: '小麦',
    CARROT: 'ニンジン',
    CABBAGE: 'キャベツ',
    HERB: '薬草',
  }
  const jpName = nameMap[cropType] ?? cropType

  const rows = await sql<{ id: string }[]>`
    SELECT id FROM item_templates WHERE name = ${jpName} LIMIT 1
  `
  return rows[0]?.id ?? null
}
