/**
 * キャラクター生成・管理サービス
 */
import { sql } from '../db/client.js'

export interface CreateCharacterResult {
  success: boolean
  characterId?: string
  villageName?: string
  nationName?: string
  errorCode?: 'ACTIVE_CHARACTER_EXISTS' | 'NO_VILLAGE_AVAILABLE'
  message?: string
}

const INITIAL_GOLD_BY_ECONOMY: Record<string, [number, number]> = {
  LOW:    [10, 50],
  MEDIUM: [51, 150],
  HIGH:   [151, 300],
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function economyLevel(level: number): string {
  if (level <= 3) return 'LOW'
  if (level <= 7) return 'MEDIUM'
  return 'HIGH'
}

/**
 * 新規キャラクターを生成する
 * アカウント登録完了時または転生時に呼び出す
 */
export async function createCharacter(playerId: string): Promise<CreateCharacterResult> {
  // 既存のアクティブキャラクターを確認
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM characters
    WHERE player_id = ${playerId} AND status != 'INACTIVE'
    LIMIT 1
  `
  if (existing.length > 0) {
    return {
      success: false,
      errorCode: 'ACTIVE_CHARACTER_EXISTS',
      message: '既にアクティブなキャラクターが存在します。',
    }
  }

  // ランダムなVillageを選択（廃村でないもの）
  const villages = await sql<{
    id: string
    name: string
    nationId: string
    economyLevel: number
  }[]>`
    SELECT v.id, v.name, v.nation_id, v.economy_level
    FROM villages v
    WHERE v.is_abandoned = false
    ORDER BY RANDOM()
    LIMIT 1
  `

  if (villages.length === 0) {
    return { success: false, errorCode: 'NO_VILLAGE_AVAILABLE', message: '利用可能な村がありません。' }
  }

  const village = villages[0]!
  const nation = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM nations WHERE id = ${village.nationId} LIMIT 1
  `
  const nationData = nation[0]!

  // 初期パラメーターをランダム生成（プレイヤー非公開）
  const age = randomInt(16, 20)
  const health = randomInt(60, 100)
  const ecoKey = economyLevel(village.economyLevel)
  const [goldMin, goldMax] = INITIAL_GOLD_BY_ECONOMY[ecoKey]!
  const gold = randomInt(goldMin, goldMax)

  // スキル成長値の初期値（ランダム）
  const skillFarming = randomInt(0, 20)
  const skillCombat = randomInt(0, 20)
  const skillSocial = randomInt(0, 20)

  // キャラクター名は仮（後でプレイヤーが設定）
  const name = `旅人${Math.floor(Math.random() * 9999)}`

  const [character] = await sql<{ id: string }[]>`
    INSERT INTO characters (
      player_id, name, age, health, health_max, gold,
      village_id, nation_id,
      skill_farming_growth, skill_combat_growth, skill_social_growth
    ) VALUES (
      ${playerId}, ${name}, ${age}, ${health}, ${health}, ${gold},
      ${village.id}, ${nationData.id},
      ${skillFarming}, ${skillCombat}, ${skillSocial}
    )
    RETURNING id
  `

  return {
    success: true,
    characterId: character!.id,
    villageName: village.name,
    nationName: nationData.name,
  }
}

/**
 * キャラクターの状態をプレイヤー向けテキストで返す
 * 内部数値は含めない
 */
export async function getCharacterStatus(characterId: string): Promise<{
  name: string
  age: number
  healthText: string
  hungerText: string
  thirstText: string
  fatigueText: string
  stressText: string
  gold: number
  villageName: string
  nationName: string
  taxDebt: number
  currentAction: string | null
  actionCompletesAt: Date | null
  skills: { category: string; exp: number; rank: string }[]
} | null> {
  const rows = await sql<{
    id: string
    name: string
    age: number
    health: number
    healthMax: number
    hungerInternal: number
    thirstInternal: number
    fatigueInternal: number
    stressInternal: number
    gold: number
    status: string
    villageName: string
    nationName: string
  }[]>`
    SELECT
      c.id, c.name, c.age, c.health, c.health_max,
      c.hunger_internal, c.thirst_internal, c.fatigue_internal, c.stress_internal,
      c.gold, c.status,
      v.name AS village_name,
      n.name AS nation_name
    FROM characters c
    JOIN villages v ON c.village_id = v.id
    JOIN nations n ON c.nation_id = n.id
    WHERE c.id = ${characterId} AND c.status != 'INACTIVE'
    LIMIT 1
  `

  if (rows.length === 0) return null
  const c = rows[0]!

  // 現在の行動を取得
  const actions = await sql<{ actionType: string; scheduledCompletionAt: Date }[]>`
    SELECT action_type, scheduled_completion_at
    FROM action_queue
    WHERE character_id = ${characterId} AND status = 'ACTIVE'
    LIMIT 1
  `
  const action = actions[0] ?? null

  const taxDebts = await sql<{ amount: number }[]>`
    SELECT SUM(amount)::INTEGER as amount FROM tax_debts WHERE character_id = ${characterId}
  `
  const taxDebt = taxDebts[0]?.amount ?? 0

  const { getCharacterSkills } = await import('../skills/skillService.js')
  const detailedSkills = await getCharacterSkills(characterId)

  return {
    name: c.name,
    age: c.age,
    healthText: toHealthText(c.health, c.healthMax),
    hungerText: toHungerText(c.hungerInternal),
    thirstText: toThirstText(c.thirstInternal),
    fatigueText: toFatigueText(c.fatigueInternal),
    stressText: toStressText(c.stressInternal),
    gold: c.gold,
    villageName: c.villageName,
    nationName: c.nationName,
    taxDebt,
    currentAction: action?.actionType ?? null,
    actionCompletesAt: action?.scheduledCompletionAt ?? null,
    skills: detailedSkills,
  }
}

// --- テキスト変換関数（内部数値をプレイヤー向けテキストに変換）---

function toHealthText(health: number, max: number): string {
  const ratio = health / max
  if (ratio >= 0.9) return '絶好調だ'
  if (ratio >= 0.7) return '体調は良い'
  if (ratio >= 0.5) return '少し疲れている'
  if (ratio >= 0.3) return 'かなり消耗している'
  if (ratio >= 0.1) return '瀕死の状態だ'
  return '限界に近い'
}

function toHungerText(hunger: number): string {
  if (hunger >= 80) return '満腹だ'
  if (hunger >= 60) return '少し空腹だ'
  if (hunger >= 40) return 'かなり腹が減っている'
  if (hunger >= 20) return '空腹で力が出ない'
  return '限界に近い。何か食べなければ'
}

function toThirstText(thirst: number): string {
  if (thirst >= 80) return '喉は潤っている'
  if (thirst >= 60) return '少し喉が渇いている'
  if (thirst >= 40) return 'かなり喉が渇いている'
  if (thirst >= 20) return '口が乾いてめまいがする'
  return '脱水状態に近い。水が必要だ'
}

function toFatigueText(fatigue: number): string {
  if (fatigue <= 20) return '元気だ'
  if (fatigue <= 40) return '少し疲れている'
  if (fatigue <= 60) return 'かなり疲弊している'
  if (fatigue <= 80) return '体が重い。休みたい'
  return '限界だ。今すぐ休まなければ'
}

function toStressText(stress: number): string {
  if (stress <= 20) return '心は穏やかだ'
  if (stress <= 40) return '少し気が滅入っている'
  if (stress <= 60) return '心が疲弊している'
  if (stress <= 80) return '精神的に追い詰められている'
  return '精神的に限界だ'
}
