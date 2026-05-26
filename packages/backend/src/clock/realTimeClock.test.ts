import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { calculateGameTime, getElapsedGameDays, getCompletionTime } from './realTimeClock.js'

describe('Real_Time_Clock', () => {
  // Property 15: 昼夜判定の正確性保証
  it('Property 15: UTC 6:00〜18:00はDAY、それ以外はNIGHT', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }), // UTC時
        fc.integer({ min: 0, max: 59 }), // 分
        (hour, minute) => {
          const epoch = new Date('2024-01-01T00:00:00Z')
          const now = new Date(`2024-06-15T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`)
          const gameTime = calculateGameTime(epoch, now)
          const expectedIsDay = hour >= 6 && hour < 18
          return gameTime.isDay === expectedIsDay
        }
      ),
      { numRuns: 100 }
    )
  })

  it('エポックと同時刻ではgameDay=0', () => {
    const epoch = new Date('2024-01-01T00:00:00Z')
    const gameTime = calculateGameTime(epoch, epoch)
    expect(gameTime.gameDay).toBe(0)
  })

  it('現実1時間後はgameDay=1', () => {
    const epoch = new Date('2024-01-01T00:00:00Z')
    const oneHourLater = new Date(epoch.getTime() + 60 * 60 * 1000)
    const gameTime = calculateGameTime(epoch, oneHourLater)
    expect(gameTime.gameDay).toBe(1)
  })

  it('現実3時間後はgameDay=3', () => {
    const epoch = new Date('2024-01-01T00:00:00Z')
    const threeHoursLater = new Date(epoch.getTime() + 3 * 60 * 60 * 1000)
    const gameTime = calculateGameTime(epoch, threeHoursLater)
    expect(gameTime.gameDay).toBe(3)
  })

  it('春から始まり91日後は夏', () => {
    const epoch = new Date('2024-01-01T00:00:00Z')
    const summer = new Date(epoch.getTime() + 91 * 60 * 60 * 1000)
    const gameTime = calculateGameTime(epoch, summer)
    expect(gameTime.gameSeason).toBe('SUMMER')
  })

  it('getElapsedGameDaysは最大30日を返す', () => {
    const from = new Date('2024-01-01T00:00:00Z')
    const farFuture = new Date(from.getTime() + 100 * 60 * 60 * 1000) // 100時間後
    const days = getElapsedGameDays(from, farFuture)
    expect(days).toBe(30)
  })

  it('getCompletionTimeは正しい完了時刻を返す', () => {
    const from = new Date('2024-01-01T00:00:00Z')
    const completion = getCompletionTime(2, from) // 2ゲーム日後 = 現実2時間後
    expect(completion.getTime()).toBe(from.getTime() + 2 * 60 * 60 * 1000)
  })
})
