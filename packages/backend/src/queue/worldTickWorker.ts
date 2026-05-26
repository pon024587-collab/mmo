/**
 * World_Tick ワーカー（完全版）
 * 現実1時間ごとに世界の状態を更新する
 */
import { Queue, Worker, type Job } from 'bullmq'
import { getRedis } from './redis.js'
import { sql } from '../db/client.js'
import { updateDiplomacy, updateNationEconomy } from '../diplomacy/diplomacyService.js'
import { collectTaxes, applyDebtInterest } from '../economy/taxService.js'
import { propagateRumors, createRumor } from '../world/rumorService.js'
import { recoverEcosystem, checkMonsterOverpopulation, triggerDisaster } from '../world/ecosystemService.js'
import { processInjuryDegradation, checkContagion } from '../health/healthService.js'
import { checkChildBirth } from '../social/marriageService.js'
import { calculateGameTime } from '../clock/realTimeClock.js'

export const WORLD_TICK_QUEUE = 'world-tick'
export const ACTION_COMPLETE_QUEUE = 'action-complete'

let tickCount = 0

export async function initWorldTickQueue(): Promise<Queue> {
  const queue = new Queue(WORLD_TICK_QUEUE, { connection: getRedis() })
  await queue.obliterate({ force: true }).catch(() => {})
  await queue.add('tick', {}, { repeat: { every: 60 * 60 * 1000 } })
  return queue
}

export function startWorldTickWorker(): Worker {
  const worker = new Worker(
    WORLD_TICK_QUEUE,
    async (_job: Job) => {
      const tickTime = new Date()
      tickCount++
      console.log(`[World_Tick #${tickCount}] 開始: ${tickTime.toISOString()}`)

      try {
        // 毎Tick（1時間ごと）
        await updateVillageWeather()
        await updateCharacterSurvivalParams()
        await updateCharacterFatigue()
        await updateBodyTemperatures()
        await processInjuryDegradation()
        await propagateRumors()

        // 7Tickごと（7時間 = ゲーム内7日）
        if (tickCount % 7 === 0) {
          await updateDiplomacy()
          await updateNationEconomy()
          await collectTaxes()
          await applyDebtInterest()
          await updateVillageDevelopment()
        }

        // 24Tickごと（24時間）
        if (tickCount % 24 === 0) {
          await recoverEcosystem()
          await checkMonsterOverpopulation()
          await checkChildBirth()
          const { cleanupExpiredRelationships } = await import('../social/mentorService.js')
          await cleanupExpiredRelationships()
        }

        // 72Tickごと（72時間）
        if (tickCount % 72 === 0) {
          await triggerDisaster()
        }

        // 季節変化（3Tickごと）
        const epoch = await getEpoch()
        const gameTime = calculateGameTime(epoch, tickTime)

        // 季節が変わったら祭りイベントをチェック
        const prevSeason = await getCurrentSeason()
        if (gameTime.gameSeason !== prevSeason) {
          const { checkFestivalEvent } = await import('../knowledge/knowledgeService.js')
          await checkFestivalEvent(gameTime.gameSeason)
        }

        await sql`
          INSERT INTO system_config (key, value)
          VALUES ('current_season', ${gameTime.gameSeason})
          ON CONFLICT (key) DO UPDATE SET value = ${gameTime.gameSeason}, updated_at = NOW()
        `

        // 最終Tick時刻を保存
        await sql`
          INSERT INTO system_config (key, value)
          VALUES ('last_world_tick', ${tickTime.toISOString()})
          ON CONFLICT (key) DO UPDATE SET value = ${tickTime.toISOString()}, updated_at = NOW()
        `

        console.log(`[World_Tick #${tickCount}] 完了`)
      } catch (err) {
        console.error(`[World_Tick #${tickCount}] エラー:`, err)
      }
    },
    { connection: getRedis(), concurrency: 1 }
  )

  worker.on('failed', (job, err) => {
    console.error(`[World_Tick] 失敗:`, err)
  })

  return worker
}

async function getEpoch(): Promise<Date> {
  const rows = await sql<{ value: string }[]>`
    SELECT value FROM system_config WHERE key = 'game_epoch' LIMIT 1
  `
  return rows[0] ? new Date(rows[0].value) : new Date()
}

async function updateVillageWeather(): Promise<void> {
  const villages = await sql<{ id: string; terrainType: string }[]>`
    SELECT id, terrain_type FROM villages WHERE is_abandoned = false
  `
  for (const v of villages) {
    const weather = pickWeather(v.terrainType)
    await sql`UPDATE villages SET current_weather = ${weather}, updated_at = NOW() WHERE id = ${v.id}`
  }
}

function pickWeather(terrain: string): string {
  const w: Record<string, number[]> = {
    SNOWFIELD: [5, 10, 15, 10, 60],
    MOUNTAIN:  [20, 25, 25, 15, 15],
    FOREST:    [30, 25, 30, 10, 5],
    PLAIN:     [40, 30, 20, 8, 2],
    DESERT:    [70, 20, 5, 5, 0],
    RIVER:     [35, 25, 30, 10, 0],
  }
  const weights = w[terrain] ?? w['PLAIN']!
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  const weathers = ['CLEAR', 'CLOUDY', 'RAIN', 'STORM', 'SNOW']
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i]!
    if (rand <= 0) return weathers[i]!
  }
  return 'CLEAR'
}

async function updateCharacterSurvivalParams(): Promise<void> {
  // Hunger: 1時間ごとに-5、Thirst: 30分ごとに-10（1時間Tickで-10）
  await sql`
    UPDATE characters
    SET hunger_internal = GREATEST(0, hunger_internal - 5),
        thirst_internal = GREATEST(0, thirst_internal - 10),
        updated_at = NOW()
    WHERE status != 'INACTIVE'
  `
  // Hunger/Thirstが0なら体力減少
  await sql`
    UPDATE characters
    SET health = GREATEST(0, health - 5), updated_at = NOW()
    WHERE status != 'INACTIVE' AND (hunger_internal = 0 OR thirst_internal = 0)
  `
  // 体力0なら死亡
  const dying = await sql<{ id: string }[]>`
    SELECT id FROM characters WHERE status != 'INACTIVE' AND health = 0
  `
  for (const c of dying) {
    const { processCharacterDeath } = await import('../character/lifeRecordService.js')
    await processCharacterDeath(c.id, '飢えまたは脱水')
  }
}

async function updateCharacterFatigue(): Promise<void> {
  // 睡眠中でないキャラクターのFatigueは自然には増えない（行動時に増加）
  // 強制睡眠チェック
  const exhausted = await sql<{ id: string }[]>`
    SELECT id FROM characters WHERE status = 'IDLE' AND fatigue_internal >= 100
  `
  for (const c of exhausted) {
    const { registerAction } = await import('../action/actionService.js')
    await registerAction({ characterId: c.id, actionType: 'SLEEP', durationOverrideMinutes: 240 })
  }
}

async function updateBodyTemperatures(): Promise<void> {
  const chars = await sql<{ id: string; villageId: string }[]>`
    SELECT id, village_id FROM characters WHERE status != 'INACTIVE'
  `
  for (const c of chars) {
    const village = await sql<{ currentWeather: string; terrainType: string }[]>`
      SELECT current_weather, terrain_type FROM villages WHERE id = ${c.villageId} LIMIT 1
    `
    if (!village[0]) continue
    const { updateBodyTemperature } = await import('../survival/survivalService.js')
    const season = await getCurrentSeason()
    await updateBodyTemperature(c.id, village[0].currentWeather, season, false)
  }
}

async function getCurrentSeason(): Promise<string> {
  const rows = await sql<{ value: string }[]>`
    SELECT value FROM system_config WHERE key = 'current_season' LIMIT 1
  `
  return rows[0]?.value ?? 'SPRING'
}

async function updateVillageDevelopment(): Promise<void> {
  const villages = await sql<{ id: string; population: number; foodStock: number; securityLevel: number; economyLevel: number }[]>`
    SELECT id, population, food_stock, security_level, economy_level
    FROM villages WHERE is_abandoned = false
  `
  for (const v of villages) {
    const score = (v.population * 2 + v.foodStock / 10 + v.securityLevel + v.economyLevel) / 4
    const level = Math.max(1, Math.min(10, Math.floor(score / 10)))
    await sql`UPDATE villages SET development_level = ${level}, updated_at = NOW() WHERE id = ${v.id}`

    // 廃村チェック
    if (level <= 1 && v.population === 0) {
      await sql`UPDATE villages SET is_abandoned = true WHERE id = ${v.id}`
      // 住民を強制移住
      await sql`
        UPDATE characters SET village_id = (
          SELECT id FROM villages WHERE nation_id = (
            SELECT nation_id FROM villages WHERE id = ${v.id}
          ) AND is_abandoned = false AND id != ${v.id} LIMIT 1
        ) WHERE village_id = ${v.id} AND status != 'INACTIVE'
      `
    }
  }
}
