import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { ACTION_DURATION_MINUTES } from './actionTypes.js'
import { getCompletionTimeByMinutes } from '../clock/realTimeClock.js'

describe('Action System', () => {
  // Property 4: 完了予定時刻は常に登録時刻より後
  it('Property 4: 完了予定時刻は常に現在時刻より後', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        (minutes) => {
          const now = new Date()
          const completion = getCompletionTimeByMinutes(minutes, now)
          return completion.getTime() > now.getTime()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 3: 全ActionTypeに所要時間が定義されている
  it('Property 3: 全ActionTypeの所要時間は1分以上', () => {
    for (const [actionType, duration] of Object.entries(ACTION_DURATION_MINUTES)) {
      expect(duration, `${actionType}の所要時間が0以下`).toBeGreaterThan(0)
    }
  })
})
