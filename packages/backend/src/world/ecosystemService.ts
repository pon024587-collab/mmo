/**
 * 生態系・天災システム
 */
import { sql } from '../db/client.js'
import { createRumor } from './rumorService.js'

/** 生態系の自然回復（World_Tickで72時間ごとに呼び出す） */
export async function recoverEcosystem(): Promise<void> {
  await sql`
    UPDATE ecosystem_states
    SET population = LEAST(20, population + 2), last_updated_at = NOW()
    WHERE last_updated_at < NOW() - INTERVAL '72 hours'
  `
}

/** 魔物個体数が多すぎる場合に大規模襲撃イベントを生成 */
export async function checkMonsterOverpopulation(): Promise<void> {
  const overpopulated = await sql<{ regionId: string; monsterType: string; population: number }[]>`
    SELECT region_id, monster_type, population FROM ecosystem_states
    WHERE population >= 15
  `

  for (const region of overpopulated) {
    // 村への大規模襲撃イベントを生成
    await createRumor(
      region.regionId,
      'MONSTER_RAID',
      `${region.monsterType}の大群が村に迫っている！`
    )

    // 村の治安を低下
    await sql`
      UPDATE villages SET security_level = GREATEST(0, security_level - 15)
      WHERE id = ${region.regionId}
    `
  }
}

/** 天災イベントを発生させる（World_Tickで低確率で呼び出す） */
export async function triggerDisaster(): Promise<void> {
  // 約720時間に1回の確率（1時間Tickで1/720）
  if (Math.random() > 1 / 720) return

  const disasterTypes = ['EARTHQUAKE', 'FLOOD', 'DROUGHT', 'FIRE'] as const
  type DisasterType = typeof disasterTypes[number]
  const disasterType: DisasterType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)]!

  // ランダムなNationを選択
  const nations = await sql<{ id: string }[]>`SELECT id FROM nations ORDER BY RANDOM() LIMIT 1`
  if (!nations[0]) return

  const villages = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM villages WHERE nation_id = ${nations[0].id} AND is_abandoned = false
    ORDER BY RANDOM() LIMIT 3
  `

  for (const village of villages) {
    switch (disasterType) {
      case 'EARTHQUAKE':
        await sql`UPDATE villages SET security_level = GREATEST(0, security_level - 20) WHERE id = ${village.id}`
        break
      case 'FLOOD':
        await sql`UPDATE villages SET food_stock = GREATEST(0, food_stock - 50) WHERE id = ${village.id}`
        break
      case 'DROUGHT':
        await sql`UPDATE villages SET food_stock = GREATEST(0, food_stock - 30), economy_level = GREATEST(0, economy_level - 10) WHERE id = ${village.id}`
        break
      case 'FIRE':
        await sql`UPDATE villages SET development_level = GREATEST(1, development_level - 1) WHERE id = ${village.id}`
        break
    }

    const disasterNames: Record<DisasterType, string> = {
      EARTHQUAKE: '地震',
      FLOOD: '洪水',
      DROUGHT: '干ばつ',
      FIRE: '火災',
    }
    await createRumor(village.id, 'DISASTER', `${village.name}で${disasterNames[disasterType]}が発生した！`)
  }
}
