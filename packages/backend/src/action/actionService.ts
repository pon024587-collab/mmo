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
    actionQueue = new Queue(ACTION_COMPLETE_QUEUE, { connection: getRedis() as any })
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
  const chars = await sql<{ status: string; isImprisoned: boolean }[]>`
    SELECT status, is_imprisoned FROM characters WHERE id = ${req.characterId} LIMIT 1
  `
  if (chars.length === 0) {
    return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'キャラクターが見つかりません。' }
  }

  const char = chars[0]!
  if (char.status === 'INACTIVE') {
    return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'このキャラクターは死亡しています。' }
  }

  if (char.status === 'IMPRISONED' || char.isImprisoned) {
    return { success: false, errorCode: 'CHARACTER_INACTIVE', message: '牢獄に捕らえられているため、行動できません。' }
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
  const actionRow = await sql<{ parameters: any }[]>`SELECT parameters FROM action_queue WHERE id = ${actionId} LIMIT 1`
  const params = actionRow[0]?.parameters || {}

  // 行動結果テキストを生成
  let resultText = generateResultText(actionType)

  try {
    if (actionType === 'EAT') {
      const { completeEat } = await import('../survival/survivalService.js')
      // JSONBのキーはスネークケースで返ってくる場合があるので両方対応
      const resolvedItemId = params.itemId ?? params.item_id
      console.log(`[ActionService] EAT params:`, JSON.stringify(params), `resolvedItemId:`, resolvedItemId)
      if (!resolvedItemId) {
        resultText = '食事できませんでした。アイテム情報が見つかりません。'
      } else {
        resultText = await completeEat(characterId, resolvedItemId)
      }
    } else if (actionType === 'DRINK') {
      const { completeDrink } = await import('../survival/survivalService.js')
      resultText = await completeDrink(characterId, params.itemId)
    } else if (actionType === 'SLEEP') {
      const { completeSleep } = await import('../survival/survivalService.js')
      resultText = await completeSleep(characterId)
    } else if (actionType === 'FARM_PLOW') {
      const { completeFarmPlow } = await import('../farming/farmingService.js')
      resultText = await completeFarmPlow(characterId)
    } else if (actionType === 'FARM_SOW') {
      const { completeFarmSow } = await import('../farming/farmingService.js')
      resultText = await completeFarmSow(characterId, params.cropType)
    } else if (actionType === 'FARM_WATER') {
      const { completeFarmWater } = await import('../farming/farmingService.js')
      resultText = await completeFarmWater(characterId)
    } else if (actionType === 'FARM_HARVEST') {
      const { completeFarmHarvest } = await import('../farming/farmingService.js')
      resultText = await completeFarmHarvest(characterId)
    } else if (['MINE', 'CHOP_WOOD', 'GATHER_HERBS', 'FISH'].includes(actionType)) {
      const { completeGather } = await import('../mining/miningService.js')
      resultText = await completeGather(characterId, actionType as any)
    } else if (actionType === 'COMBAT_MONSTER') {
      const { completeCombat } = await import('../combat/combatService.js')
      const monsterType = params.monsterType || 'SLIME'
      const count = params.count || 1
      const eliteMultiplier = params.eliteMultiplier || 1
      const eliteLabel = params.eliteLabel || ''
      const combatResult = await completeCombat(characterId, monsterType, count, eliteMultiplier, eliteLabel)
      resultText = combatResult.resultText
    } else if (actionType === 'COOK') {
      const { completeCook } = await import('../social/dungeonService.js')
      resultText = await completeCook(characterId, params.recipeType)
    } else if (actionType === 'DUNGEON_EXPLORE') {
      const { completeDungeonFloor } = await import('../social/dungeonService.js')
      resultText = await completeDungeonFloor(characterId, params.dungeonId, params.floor || 1)
    } else if (actionType === 'MOVE') {
      const { completeMove } = await import('../social/dungeonService.js')
      resultText = await completeMove(characterId, params.targetVillageId, params.tradeItemIds)
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`[ActionService] completeAction error for ${actionId} (${actionType}):`, err)
    resultText = `エラーが発生したため、行動を中断しました。[${actionType}] ${errMsg}`
  }

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

  // 行動完了時に賞金首であれば一定確率で衛兵遭遇フラグを立てる（ポーリング抽選からの移行）
  const { triggerGuardEncounterIfWanted } = await import('../pvp/pvpService.js')
  await triggerGuardEncounterIfWanted(characterId)
}

/**
 * 未読の行動結果を取得してクリアする
 */
export async function getPendingResults(
  characterId: string
): Promise<{ actionType: string; resultText: string; completedAt: Date }[]> {
  const results = await sql<{
    id: string
    actionType: string
    resultText: string
    completedAt: Date
  }[]>`
    SELECT id, action_type, result_text, completed_at
    FROM action_queue
    WHERE character_id = ${characterId}
      AND status = 'COMPLETED'
      AND result_text IS NOT NULL
    ORDER BY completed_at ASC
    LIMIT 50
  `

  if (results.length > 0) {
    const ids = results.map(r => r.id)
    await sql`
      UPDATE action_queue
      SET status = 'ACKNOWLEDGED'
      WHERE id IN ${sql(ids)}
    `
  }

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

/**
 * サーバー再起動等で取り残されたACTIVE状態の行動を復旧する
 */
export async function recoverStuckActions(): Promise<void> {
  const stuck = await sql<{ id: string; characterId: string; actionType: ActionType }[]>`
    SELECT id, character_id, action_type
    FROM action_queue
    WHERE status = 'ACTIVE' AND scheduled_completion_at <= NOW()
  `

  if (stuck.length > 0) {
    console.log(`[ActionService] 実行中スタック状態のアクションを ${stuck.length} 件検出しました。直接完了処理を実行します...`)
    for (const s of stuck) {
      try {
        // BullMQを通さず直接完了処理を呼び出して確実に復旧させる
        await completeAction(s.id, s.characterId, s.actionType)
        console.log(`[ActionService] アクション ${s.id} の復旧に成功しました。`)
      } catch (err) {
        console.error(`[ActionService] アクション ${s.id} の復旧に失敗しました:`, err)
        // 失敗した場合はキャラクターを強制的にIDLEに戻してロックを解除する
        await sql`UPDATE characters SET status = 'IDLE', updated_at = NOW() WHERE id = ${s.characterId}`
        await sql`UPDATE action_queue SET status = 'FAILED', result_text = 'システムエラーにより中断されました。' WHERE id = ${s.id}`
      }
    }
  }
}
