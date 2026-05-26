/**
 * 行動完了ワーカー
 * BullMQのDelayed Jobが発火したときに行動結果を処理する
 */
import { Worker, type Job } from 'bullmq'
import { getRedis } from '../queue/redis.js'
import { completeAction, ACTION_COMPLETE_QUEUE } from './actionService.js'
import type { ActionType } from './actionTypes.js'

interface ActionCompleteJobData {
  actionId: string
  characterId: string
  actionType: ActionType
}

export function startActionWorker(): Worker {
  const worker = new Worker<ActionCompleteJobData>(
    ACTION_COMPLETE_QUEUE,
    async (job: Job<ActionCompleteJobData>) => {
      const { actionId, characterId, actionType } = job.data
      console.log(`[ActionWorker] 行動完了: ${actionType} (${actionId})`)

      await completeAction(actionId, characterId, actionType)

      console.log(`[ActionWorker] 処理完了: ${actionId}`)
    },
    {
      connection: getRedis() as any,
      concurrency: 10,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[ActionWorker] 失敗 (${job?.id}):`, err)
  })

  return worker
}
