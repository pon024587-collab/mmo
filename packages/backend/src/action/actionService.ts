/**
 * リアルタイム行動システム
 * Action_Queue登録・BullMQ Delayed Job・完了処理
 */
import { Queue } from 'bullmq'
import { sql } from '../db/client.js'
import { getRedis } from '../queue/redis.js'
import { getCompletionTimeByMinutes } from '../clock/realTimeClock.js'
import { ACTION_DURATION_MINUTES, type ActionType } from './actionTypes.js'

export const ACTION_COMPLETE_QUEUE = 'action-complete'

let actionQueue: Queue | null = null

function getActionQueue(): Queue {
  if (!actionQueue) {
    actionQueue = new Queue(ACTION_COMPLETE_QUEUE, { connection: getRedis() })
  }
  return actionQueue
}

export interface RegisterActionRequest {
  characterId: string
  actionType: ActionType
  parameters?: Record<string, unknown>
  /** 所要時間を上書きする場合（分）*/
  durationOverrideMinutes?: number
}

export interface RegisterActionResult {
  success: boolean
  actionId?: string
  completionTime?: Date
  errorCode?:
    | 'CHARACTER_BUSY'
    | 'CHARACTER_INACTIVE'
    | 'MISSING_PREREQUISITE'
    | 'INSUFFICIENT_FUNDS'
    | 'INVENTORY_FULL'
    | 'FACILITY_CLOSED'
    | 'INVALID_TARGET'
  message?: string
  currentAction?: { actionType: string; completionTime: Date }
}

/**
 * 行動をAction_Queueに登録する
 */
export async function registerAction(req: RegisterActionRequest): Promise<RegisterActionResult> {
  // キャラクター状態確認
  const chars = await sql<{ status: string }[]>`
    SELECT status FROM characters WHERE id = ${req.characterId} LIMIT 1
  `
  if (chars.length === 0) {
    return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'キャラクターが見つかりません。' }
  }

  const char = chars[0]!
  if (char.status === 'INACTIVE') {
    return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'このキャラクターは死亡しています。' }
  }

  // 行動中チェック（排他制御）
  if (char.status === 'ACTIVE_ACTION') {
    const current = await sql<{ actionType: string; scheduledCompletionAt: Date }[]>`
      SELECT action_type, scheduled_completion_at
      FROM action_queue
      WHERE character_id = ${req.characterId} AND status = 'ACTIVE'
      LIMIT 1
    `
    const cur = current[0]
    return {
      success: false,
      errorCode: 'CHARACTER_BUSY',
      message: '現在別の行動を実行中です。完了するまでお待ちください。',
      currentAction: cur
        ? { actionType: cur.actionType, completionTime: cur.scheduledCompletionAt }
        : undefined,
    }
  }

  // 所要時間計算
  const durationMinutes =
    req.durationOverrideMinutes ?? ACTION_DURATION_MINUTES[req.actionType] ?? 30
  const completionTime = getCompletionTimeByMinutes(durationMinutes)

  // Action_Queue登録 + キャラクター状態更新（トランザクション）
  const [action] = await sql.begin(async (tx) => {
    const [a] = await tx<{ id: string }[]>`
      INSERT INTO action_queue (
        character_id, action_type, parameters, status, scheduled_completion_at
      ) VALUES (
        ${req.characterId},
        ${req.actionType},
        ${JSON.stringify(req.parameters ?? {})},
        'ACTIVE',
        ${completionTime}
      )
      RETURNING id
    `

    await tx`
      UPDATE characters
      SET status = 'ACTIVE_ACTION', updated_at = NOW()
      WHERE id = ${req.characterId}
    `

    return [a]
  })

  // BullMQ Delayed Jobを登録
  const delay = completionTime.getTime() - Date.now()
  const job = await getActionQueue().add(
    'complete',
    { actionId: action!.id, characterId: req.characterId, actionType: req.actionType },
    { delay: Math.max(0, delay), jobId: action!.id }
  )

  // BullMQ job IDをAction_Queueに保存
  await sql`
    UPDATE action_queue SET bullmq_job_id = ${job.id ?? ''} WHERE id = ${action!.id}
  `

  return { success: true, actionId: action!.id, completionTime }
}

/**
 * 行動完了時の処理（BullMQワーカーから呼び出される）
 */
export async function completeAction(
  actionId: string,
  characterId: string,
  actionType: ActionType
): Promise<void> {
  // 行動結果テキストを生成
  const resultText = generateResultText(actionType)

  await sql.begin(async (tx) => {
    // Action_Queueを完了状態に更新
    await tx`
      UPDATE action_queue
      SET status = 'COMPLETED', completed_at = NOW(), result_text = ${resultText}
      WHERE id = ${actionId}
    `

    // キャラクターをIDLE状態に戻す
    await tx`
      UPDATE characters
      SET status = 'IDLE', updated_at = NOW()
      WHERE id = ${characterId}
    `
  })
}

/**
 * 未読の行動結果を取得してクリアする
 */
export async function getPendingResults(
  characterId: string
): Promise<{ actionType: string; resultText: string; completedAt: Date }[]> {
  const results = await sql<{
    actionType: string
    resultText: string
    completedAt: Date
  }[]>`
    SELECT action_type, result_text, completed_at
    FROM action_queue
    WHERE character_id = ${characterId}
      AND status = 'COMPLETED'
      AND result_text IS NOT NULL
    ORDER BY completed_at ASC
    LIMIT 50
  `
  return results
}

/**
 * 行動結果テキストを生成する（簡易版）
 * 実際はSkill_Growthや状況に応じて変化する
 */
function generateResultText(actionType: ActionType): string {
  const texts: Partial<Record<ActionType, string>> = {
    FARM_PLOW:       'ぎこちなく鍬を振りながら、畑を耕した。',
    FARM_SOW:        '種を丁寧に土に埋めた。',
    FARM_WATER:      '水桶で畑に水をやった。',
    FARM_HARVEST:    '作物を収穫した。',
    COMBAT_PRACTICE: '剣を素振りした。少し汗をかいた。',
    EAT:             '食事をとった。少し元気が出た。',
    DRINK:           '水を飲んだ。喉の渇きが癒えた。',
    SLEEP:           'ぐっすりと眠った。体が回復した。',
    REST:            'しばらく休んだ。',
    PRAY:            '神殿で祈りを捧げた。',
    TALK_NPC:        '村人と話した。',
  }
  return texts[actionType] ?? `${actionType}を完了した。`
}
