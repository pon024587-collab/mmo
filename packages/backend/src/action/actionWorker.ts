/**
 * 行動完了ワーカー
 * BullMQのDelayed Jobが発火したときに行動結果を処理する
 * クエスト進捗も更新する
 */
import { Worker, type Job } from 'bullmq'
import { getRedis } from '../queue/redis.js'
import { completeAction, ACTION_COMPLETE_QUEUE } from './actionService.js'
import { updateQuestProgress } from '../quest/questService.js'
import { sql } from '../db/client.js'
import type { ActionType } from './actionTypes.js'

interface ActionCompleteJobData {
  actionId: string
  characterId: string
  actionType: ActionType
  parameters?: Record<string, unknown>
}

export function startActionWorker(): Worker {
  const worker = new Worker<ActionCompleteJobData>(
    ACTION_COMPLETE_QUEUE,
    async (job: Job<ActionCompleteJobData>) => {
      const { actionId, characterId, actionType } = job.data

      // パラメーターをDBから取得
      const actionRow = await sql<{ parameters: Record<string, unknown> }[]>`
        SELECT parameters FROM action_queue WHERE id = ${actionId} LIMIT 1
      `
      const params = actionRow[0]?.parameters ?? {}

      console.log(`[ActionWorker] 行動完了: ${actionType} (${actionId})`)
      await completeAction(actionId, characterId, actionType)

      // クエスト進捗を更新
      await updateQuestProgressForAction(characterId, actionType, params)

      console.log(`[ActionWorker] 処理完了: ${actionId}`)
    },
    {
      connection: getRedis() as never,
      concurrency: 10,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[ActionWorker] 失敗 (${job?.id}):`, err)
  })

  return worker
}

/** 行動種別に応じてクエスト進捗を更新する */
async function updateQuestProgressForAction(
  characterId: string,
  actionType: ActionType,
  params: Record<string, unknown>
): Promise<void> {
  try {
    switch (actionType) {
      case 'COMBAT_MONSTER': {
        const monsterType = params['monsterType'] as string | undefined
        const count = (params['count'] as number | undefined) ?? 1
        if (monsterType) {
          await updateQuestProgress(characterId, 'KILL_MONSTER', monsterType, count)
        }
        break
      }
      case 'FARM_HARVEST': {
        // 収穫完了 → 作物種別を取得してクエスト更新
        const farmPlot = await sql<{ cropType: string }[]>`
          SELECT crop_type FROM farm_plots WHERE character_id = ${characterId} LIMIT 1
        `
        if (farmPlot[0]?.cropType) {
          await updateQuestProgress(characterId, 'HARVEST_CROP', farmPlot[0].cropType, 1)
        }
        break
      }
      case 'GATHER_HERBS': {
        await updateQuestProgress(characterId, 'DELIVER_ITEM', '薬草', 1)
        break
      }
      case 'MINE': {
        await updateQuestProgress(characterId, 'DELIVER_ITEM', '鉄鉱石', 1)
        break
      }
      case 'CHOP_WOOD': {
        await updateQuestProgress(characterId, 'DELIVER_ITEM', '木材', 1)
        break
      }
    }
  } catch (err) {
    console.error('[ActionWorker] クエスト進捗更新エラー:', err)
  }
}
