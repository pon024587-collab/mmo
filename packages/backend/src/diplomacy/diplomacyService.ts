/**
 * 国家間外交・戦争・貿易システム
 */
import { sql } from '../db/client.js'

export type DiplomacyState = 'ALLIANCE' | 'NEUTRAL' | 'HOSTILE' | 'WAR' | 'TRADE'

/** 外交状態を計算・更新する（World_Tickで7時間ごとに呼び出す） */
export async function updateDiplomacy(): Promise<void> {
  const nations = await sql<{ id: string; militaryPower: number; economicPower: number; diplomaticSkill: number }[]>`
    SELECT id, military_power, economic_power, diplomatic_skill FROM nations
  `

  for (let i = 0; i < nations.length; i++) {
    for (let j = i + 1; j < nations.length; j++) {
      const a = nations[i]!
      const b = nations[j]!

      const current = await sql<{ state: string }[]>`
        SELECT state FROM diplomacy_states
        WHERE nation_a_id = ${a.id} AND nation_b_id = ${b.id}
        LIMIT 1
      `
      const currentState = (current[0]?.state ?? 'NEUTRAL') as DiplomacyState

      const newState = calculateDiplomacyChange(currentState, a, b)

      await sql`
        INSERT INTO diplomacy_states (nation_a_id, nation_b_id, state)
        VALUES (${a.id}, ${b.id}, ${newState})
        ON CONFLICT (nation_a_id, nation_b_id)
        DO UPDATE SET state = ${newState}, updated_at = NOW()
      `

      // 戦争開始時は村の治安を低下
      if (newState === 'WAR' && currentState !== 'WAR') {
        await sql`
          UPDATE villages
          SET security_level = GREATEST(0, security_level - ${Math.floor(Math.random() * 21) + 10})
          WHERE nation_id IN (${a.id}, ${b.id})
        `
      }

      // 貿易協定成立時は経済レベルを向上
      if (newState === 'TRADE' && currentState !== 'TRADE') {
        await sql`
          UPDATE villages
          SET economy_level = LEAST(100, economy_level + ${Math.floor(Math.random() * 11) + 5})
          WHERE nation_id IN (${a.id}, ${b.id})
        `
      }
    }
  }
}

function calculateDiplomacyChange(
  current: DiplomacyState,
  a: { militaryPower: number; economicPower: number; diplomaticSkill: number },
  b: { militaryPower: number; economicPower: number; diplomaticSkill: number }
): DiplomacyState {
  const rand = Math.random()
  const avgDiplomatic = (a.diplomaticSkill + b.diplomaticSkill) / 2
  const powerDiff = Math.abs(a.militaryPower - b.militaryPower)

  // 現在の状態から遷移確率を計算
  switch (current) {
    case 'NEUTRAL':
      if (rand < 0.05 && powerDiff > 30) return 'HOSTILE'
      if (rand < 0.1 && avgDiplomatic > 60) return 'TRADE'
      return 'NEUTRAL'
    case 'HOSTILE':
      if (rand < 0.1 && powerDiff > 40) return 'WAR'
      if (rand < 0.15 && avgDiplomatic > 50) return 'NEUTRAL'
      return 'HOSTILE'
    case 'WAR':
      if (rand < 0.1) return 'HOSTILE' // 戦争終結
      return 'WAR'
    case 'TRADE':
      if (rand < 0.05) return 'NEUTRAL'
      return 'TRADE'
    case 'ALLIANCE':
      if (rand < 0.03) return 'NEUTRAL'
      return 'ALLIANCE'
    default:
      return 'NEUTRAL'
  }
}

/** 国家の経済状態を計算する（World_Tickで毎日呼び出す） */
export async function updateNationEconomy(): Promise<void> {
  const nations = await sql<{ id: string }[]>`SELECT id FROM nations`

  for (const nation of nations) {
    // 農業生産量・交易量・税収を計算してeconomic_powerを更新
    const villages = await sql<{ economyLevel: number; foodStock: number }[]>`
      SELECT economy_level, food_stock FROM villages WHERE nation_id = ${nation.id} AND is_abandoned = false
    `
    if (villages.length === 0) continue

    const avgEconomy = villages.reduce((s, v) => s + v.economyLevel, 0) / villages.length
    const newEconomicPower = Math.round(avgEconomy)

    await sql`
      UPDATE nations SET economic_power = ${newEconomicPower}, updated_at = NOW()
      WHERE id = ${nation.id}
    `
  }
}
