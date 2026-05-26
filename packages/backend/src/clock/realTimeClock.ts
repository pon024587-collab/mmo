/**
 * Real_Time_Clock モジュール
 * 現実時間とゲーム内時間の同期を管理する
 *
 * 換算レート:
 *   現実 1時間  = ゲーム内 1日
 *   現実 3時間  = ゲーム内 3日（季節変化）
 *   現実 12時間 = ゲーム内 1季節（春夏秋冬）
 *   現実 365時間 = ゲーム内 1年
 *
 * 昼夜サイクル:
 *   UTC 06:00〜18:00 = 昼
 *   UTC 18:00〜06:00 = 夜
 */

export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'

export interface GameTime {
  realTime: Date
  /** エポックからの経過ゲーム内日数 */
  gameDay: number
  gameSeason: Season
  /** 現在の年（エポックを1年目とする） */
  gameYear: number
  isDay: boolean
  /** 次の昼夜切り替えまでの現実時間（ms） */
  msUntilNextDayNightChange: number
}

const REAL_MS_PER_GAME_DAY = 60 * 60 * 1000 // 1時間
const GAME_DAYS_PER_SEASON = 91 // 約91日で1季節（365/4）
const GAME_DAYS_PER_YEAR = 365

const SEASONS: Season[] = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER']

/**
 * エポック時刻からゲーム内時刻を計算する
 */
export function calculateGameTime(epoch: Date, now: Date = new Date()): GameTime {
  const elapsedMs = now.getTime() - epoch.getTime()
  const gameDay = Math.floor(elapsedMs / REAL_MS_PER_GAME_DAY)
  const gameYear = Math.floor(gameDay / GAME_DAYS_PER_YEAR) + 1
  const dayOfYear = gameDay % GAME_DAYS_PER_YEAR
  const seasonIndex = Math.floor(dayOfYear / GAME_DAYS_PER_SEASON) % 4
  const gameSeason = SEASONS[seasonIndex] ?? 'SPRING'

  // 昼夜判定（UTC時刻基準）
  const utcHour = now.getUTCHours()
  const isDay = utcHour >= 6 && utcHour < 18

  // 次の昼夜切り替えまでの時間
  const utcMinutes = now.getUTCMinutes()
  const utcSeconds = now.getUTCSeconds()
  const utcMs = now.getUTCMilliseconds()
  const minutesIntoHour = utcMinutes * 60 * 1000 + utcSeconds * 1000 + utcMs

  let msUntilNextDayNightChange: number
  if (isDay) {
    // 次の夜（18:00 UTC）まで
    const hoursUntil18 = 18 - utcHour - 1
    msUntilNextDayNightChange = hoursUntil18 * 60 * 60 * 1000 + (60 * 60 * 1000 - minutesIntoHour)
  } else {
    // 次の昼（06:00 UTC）まで
    const hoursUntil6 = utcHour >= 18 ? 24 - utcHour + 6 - 1 : 6 - utcHour - 1
    msUntilNextDayNightChange = hoursUntil6 * 60 * 60 * 1000 + (60 * 60 * 1000 - minutesIntoHour)
  }

  return {
    realTime: now,
    gameDay,
    gameSeason,
    gameYear,
    isDay,
    msUntilNextDayNightChange,
  }
}

/**
 * 2つの時刻間の経過ゲーム内日数を計算する（最大30日）
 */
export function getElapsedGameDays(from: Date, to: Date = new Date()): number {
  const elapsedMs = to.getTime() - from.getTime()
  const days = Math.floor(elapsedMs / REAL_MS_PER_GAME_DAY)
  return Math.min(days, 30) // 最大30日分
}

/**
 * 指定したゲーム内日数後の現実時刻を返す
 */
export function getCompletionTime(gameDays: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + gameDays * REAL_MS_PER_GAME_DAY)
}

/**
 * 指定した現実時間（分）後の完了時刻を返す
 */
export function getCompletionTimeByMinutes(realMinutes: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + realMinutes * 60 * 1000)
}
