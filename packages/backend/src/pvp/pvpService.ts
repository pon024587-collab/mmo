/**
 * PvP・賞金首・衛兵・商隊・道中システム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

// ---- 衛兵遭遇イベント ----

const GUARD_POWER = 300 // 衛兵の強さ（かなり強い）

/** 都市移動時の衛兵遭遇チェック */
export async function checkGuardEncounter(characterId: string): Promise<{
  encountered: boolean
  hasCriminalRecord: boolean
  bountyAmount: number
}> {
  const char = await sql<{ bountyAmount: number; isCaptured: boolean }[]>`
    SELECT bounty_amount, is_captured FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { encountered: false, hasCriminalRecord: false, bountyAmount: 0 }

  // 30%の確率で衛兵に遭遇
  const encountered = Math.random() < 0.3
  const hasCriminalRecord = char[0].bountyAmount > 0

  return { encountered, hasCriminalRecord, bountyAmount: char[0].bountyAmount }
}

/** 衛兵と戦う */
export async function fightGuard(characterId: string): Promise<{
  victory: boolean
  resultText: string
}> {
  const char = await sql<{ skillCombatGrowth: number }[]>`
    SELECT skill_combat_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const skill = char[0]?.skillCombatGrowth ?? 0

  // 衛兵はかなり強い（スキル300相当）
  const playerPower = skill + Math.random() * 20
  const guardPower = GUARD_POWER + Math.random() * 50
  const victory = playerPower >= guardPower * 0.6

  if (victory) {
    // 勝利しても犯罪記録が増える
    await addBounty(characterId, 200, '衛兵への暴行')
    return { victory: true, resultText: '衛兵を倒した。しかし、これで賞金首としての額が跳ね上がった。逃げるしかない。' }
  } else {
    // 敗北→拘束8時間
    await imprison(characterId, 8)
    return { victory: false, resultText: '衛兵に敗れた。最低限の治療を受け、牢に入れられた。' }
  }
}

/** 衛兵から逃げる */
export async function fleeFromGuard(characterId: string): Promise<{
  success: boolean
  resultText: string
}> {
  const char = await sql<{ skillCombatGrowth: number; dexterityGrowth: number }[]>`
    SELECT skill_combat_growth, dexterity_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const dex = char[0]?.dexterityGrowth ?? 0

  // 器用さが高いほど逃げやすい
  const fleeChance = 0.3 + (dex / 500)
  const success = Math.random() < fleeChance

  if (success) {
    return { success: true, resultText: '衛兵の目を掻い潜り、なんとか逃げ切った。' }
  } else {
    await imprison(characterId, 8)
    return { success: false, resultText: '逃げようとしたが捕まった。牢に入れられた。' }
  }
}

/** 自首する */
export async function surrender(characterId: string): Promise<string> {
  await imprison(characterId, 6) // 自首は6時間
  // 賞金首を解除
  await sql`
    UPDATE characters SET bounty_amount = 0 WHERE id = ${characterId}
  `
  await sql`
    UPDATE bounties SET is_active = false WHERE character_id = ${characterId}
  `
  return '自首した。6時間の拘束と引き換えに、犯罪記録が消えた。'
}

/** 拘束処理 */
async function imprison(characterId: string, hours: number): Promise<void> {
  const endsAt = new Date(Date.now() + hours * 60 * 60 * 1000)
  await sql`
    UPDATE characters
    SET is_imprisoned = true,
        imprisonment_ends_at = ${endsAt},
        status = 'ACTIVE_ACTION',
        updated_at = NOW()
    WHERE id = ${characterId}
  `
}

/** 拘束解除チェック（World_Tickで呼び出す） */
export async function checkImprisonmentRelease(): Promise<void> {
  await sql`
    UPDATE characters
    SET is_imprisoned = false,
        imprisonment_ends_at = NULL,
        status = 'IDLE',
        updated_at = NOW()
    WHERE is_imprisoned = true
      AND imprisonment_ends_at IS NOT NULL
      AND imprisonment_ends_at <= NOW()
  `
}

// ---- 賞金首 ----

/** 賞金を追加する */
export async function addBounty(
  characterId: string,
  amount: number,
  reason: string
): Promise<void> {
  const char = await sql<{ nationId: string }[]>`
    SELECT nation_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return

  await sql`
    UPDATE characters SET bounty_amount = bounty_amount + ${amount} WHERE id = ${characterId}
  `
  await sql`
    INSERT INTO bounties (character_id, nation_id, amount, reason)
    VALUES (${characterId}, ${char[0].nationId}, ${amount}, ${reason})
  `
}

// ---- PvP ----

/** プレイヤーを攻撃する */
export async function attackPlayer(
  attackerId: string,
  targetId: string,
  intent: 'KILL' | 'CAPTURE'
): Promise<RegisterActionResult> {
  // 同じ村にいるか確認
  const chars = await sql<{ id: string; villageId: string; isCaptured: boolean }[]>`
    SELECT id, village_id, is_captured FROM characters
    WHERE id IN (${attackerId}, ${targetId}) AND status != 'INACTIVE'
  `
  if (chars.length < 2) return { success: false, errorCode: 'INVALID_TARGET', message: '対象が見つかりません。' }

  const attacker = chars.find(c => c.id === attackerId)
  const target = chars.find(c => c.id === targetId)

  if (!attacker || !target) return { success: false, errorCode: 'INVALID_TARGET', message: '対象が見つかりません。' }
  if (attacker.villageId !== target.villageId) {
    return { success: false, errorCode: 'INVALID_TARGET', message: '同じ場所にいる相手にしか攻撃できません。' }
  }
  if (target.isCaptured) {
    return { success: false, errorCode: 'INVALID_TARGET', message: 'その人はすでに捕まっています。' }
  }

  return registerAction({
    characterId: attackerId,
    actionType: 'COMBAT_MONSTER',
    parameters: { pvp: true, targetId, intent },
    durationOverrideMinutes: 10,
  })
}

/** PvP戦闘完了 */
export async function completePvp(
  attackerId: string,
  targetId: string,
  intent: 'KILL' | 'CAPTURE'
): Promise<string> {
  const attacker = await sql<{ skillCombatGrowth: number }[]>`
    SELECT skill_combat_growth FROM characters WHERE id = ${attackerId} LIMIT 1
  `
  const target = await sql<{ skillCombatGrowth: number; name: string; bountyAmount: number }[]>`
    SELECT skill_combat_growth, name, bounty_amount FROM characters WHERE id = ${targetId} LIMIT 1
  `
  if (!attacker[0] || !target[0]) return '戦闘結果を処理できませんでした。'

  const attackerPower = attacker[0].skillCombatGrowth + Math.random() * 30
  const targetPower = target[0].skillCombatGrowth + Math.random() * 30
  const victory = attackerPower > targetPower

  if (victory) {
    // 攻撃者に犯罪記録
    await addBounty(attackerId, intent === 'KILL' ? 500 : 200, `プレイヤー${intent === 'KILL' ? '殺害' : '拉致'}`)

    if (intent === 'KILL') {
      // 対象を死亡させる
      await sql`UPDATE characters SET health = 0, updated_at = NOW() WHERE id = ${targetId}`
      return `${target[0].name}を倒した。賞金首として額が上がった。`
    } else {
      // 対象を捕縛
      await sql`
        UPDATE characters
        SET is_captured = true, captured_by = ${attackerId}, status = 'ACTIVE_ACTION', updated_at = NOW()
        WHERE id = ${targetId}
      `
      await sql`
        INSERT INTO prisoners (prisoner_character_id, captor_character_id)
        VALUES (${targetId}, ${attackerId})
        ON CONFLICT (prisoner_character_id) DO NOTHING
      `
      return `${target[0].name}を捕まえた。衛兵所に引き渡すと報酬がもらえる。`
    }
  } else {
    return `${target[0].name}との戦いに敗れた。`
  }
}

/** 囚人を衛兵所に引き渡す */
export async function deliverPrisoner(
  captorId: string,
  prisonerId: string
): Promise<{ success: boolean; reward?: number; message?: string }> {
  const prisoner = await sql<{ id: string; bountyAmount: number; name: string; isCaptured: boolean; capturedBy: string }[]>`
    SELECT id, bounty_amount, name, is_captured, captured_by FROM characters WHERE id = ${prisonerId} LIMIT 1
  `
  if (!prisoner[0] || !prisoner[0].isCaptured || prisoner[0].capturedBy !== captorId) {
    return { success: false, message: 'この囚人を引き渡す権限がありません。' }
  }

  const reward = Math.max(100, prisoner[0].bountyAmount)

  await sql.begin(async (tx) => {
    // 報酬付与
    await tx`UPDATE characters SET gold = gold + ${reward}, updated_at = NOW() WHERE id = ${captorId}`
    // 囚人を解放・拘束
    await tx`
      UPDATE characters
      SET is_captured = false, captured_by = NULL, bounty_amount = 0,
          is_imprisoned = true,
          imprisonment_ends_at = NOW() + INTERVAL '8 hours',
          updated_at = NOW()
      WHERE id = ${prisonerId}
    `
    await tx`UPDATE prisoners SET is_released = true WHERE prisoner_character_id = ${prisonerId}`
    await tx`UPDATE bounties SET is_active = false WHERE character_id = ${prisonerId}`
  })

  return { success: true, reward, message: `${prisoner[0].name}を引き渡した。${reward}Gの報酬を受け取った。` }
}

// ---- 商隊システム ----

/** 商隊一覧を取得 */
export async function getAvailableCaravans(villageId: string): Promise<{
  id: string
  destinationName: string
  departureAt: Date
  passengerFee: number
  guardReward: number
}[]> {
  return sql`
    SELECT c.id, v.name as destination_name, c.departure_at, c.passenger_fee, c.guard_reward
    FROM caravans c
    JOIN villages v ON c.destination_village_id = v.id
    WHERE c.origin_village_id = ${villageId}
      AND c.status = 'SCHEDULED'
      AND c.departure_at > NOW()
    ORDER BY c.departure_at ASC
    LIMIT 5
  `
}

/** 商隊に乗客として参加 */
export async function joinCaravanAsPassenger(
  characterId: string,
  caravanId: string
): Promise<{ success: boolean; message?: string }> {
  const caravan = await sql<{ id: string; passengerFee: number; arrivalAt: Date; destinationVillageId: string }[]>`
    SELECT id, passenger_fee, arrival_at, destination_village_id FROM caravans WHERE id = ${caravanId} LIMIT 1
  `
  if (!caravan[0]) return { success: false, message: '商隊が見つかりません。' }

  const char = await sql<{ gold: number }[]>`SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1`
  if (!char[0] || char[0].gold < caravan[0].passengerFee) {
    return { success: false, message: `乗車賃が足りません。必要: ${caravan[0].passengerFee}G` }
  }

  await sql.begin(async (tx) => {
    await tx`UPDATE characters SET gold = gold - ${caravan[0]!.passengerFee}, updated_at = NOW() WHERE id = ${characterId}`
    await tx`INSERT INTO caravan_members (caravan_id, character_id, role) VALUES (${caravanId}, ${characterId}, 'PASSENGER') ON CONFLICT DO NOTHING`
    // 移動行動を登録（疲労なし）
    await tx`
      INSERT INTO action_queue (character_id, action_type, parameters, status, scheduled_completion_at)
      VALUES (${characterId}, 'MOVE', ${JSON.stringify({ caravanId, noFatigue: true, destinationVillageId: caravan[0]!.destinationVillageId })}, 'ACTIVE', ${caravan[0]!.arrivalAt})
    `
    await tx`UPDATE characters SET status = 'ACTIVE_ACTION', updated_at = NOW() WHERE id = ${characterId}`
  })

  return { success: true, message: `商隊に乗客として参加した。疲れずに目的地へ向かえる。` }
}

/** 商隊を護衛として参加 */
export async function joinCaravanAsGuard(
  characterId: string,
  caravanId: string
): Promise<{ success: boolean; message?: string }> {
  const caravan = await sql<{ id: string; guardReward: number; arrivalAt: Date; destinationVillageId: string }[]>`
    SELECT id, guard_reward, arrival_at, destination_village_id FROM caravans WHERE id = ${caravanId} LIMIT 1
  `
  if (!caravan[0]) return { success: false, message: '商隊が見つかりません。' }

  await sql.begin(async (tx) => {
    await tx`INSERT INTO caravan_members (caravan_id, character_id, role) VALUES (${caravanId}, ${characterId}, 'GUARD') ON CONFLICT DO NOTHING`
    await tx`
      INSERT INTO action_queue (character_id, action_type, parameters, status, scheduled_completion_at)
      VALUES (${characterId}, 'MOVE', ${JSON.stringify({ caravanId, isGuard: true, guardReward: caravan[0]!.guardReward, destinationVillageId: caravan[0]!.destinationVillageId })}, 'ACTIVE', ${caravan[0]!.arrivalAt})
    `
    await tx`UPDATE characters SET status = 'ACTIVE_ACTION', updated_at = NOW() WHERE id = ${characterId}`
  })

  return { success: true, message: `商隊の護衛として参加した。道中の魔物や盗賊に注意が必要だ。` }
}

/** 道中に潜む（盗賊行為） */
export async function setupAmbush(
  characterId: string,
  routeVillageA: string,
  routeVillageB: string,
  maxAttacks: number
): Promise<RegisterActionResult> {
  // 犯罪記録に追加
  await addBounty(characterId, 50, '道中での待ち伏せ準備')

  await sql`
    INSERT INTO ambush_setups (character_id, route_village_a, route_village_b, max_attacks)
    VALUES (${characterId}, ${routeVillageA}, ${routeVillageB}, ${maxAttacks})
  `

  return registerAction({
    characterId,
    actionType: 'MOVE',
    parameters: { ambush: true, routeVillageA, routeVillageB },
    durationOverrideMinutes: 30,
  })
}

/** 商隊を定期生成する（World_Tickで呼び出す） */
export async function generateCaravans(): Promise<void> {
  const villages = await sql<{ id: string }[]>`
    SELECT id FROM villages WHERE is_abandoned = false ORDER BY RANDOM() LIMIT 10
  `

  for (let i = 0; i < villages.length - 1; i++) {
    const origin = villages[i]!
    const dest = villages[i + 1]!

    // 現実2〜6時間後に出発
    const departureHours = Math.floor(Math.random() * 4) + 2
    const travelHours = Math.floor(Math.random() * 3) + 1
    const departureAt = new Date(Date.now() + departureHours * 60 * 60 * 1000)
    const arrivalAt = new Date(departureAt.getTime() + travelHours * 60 * 60 * 1000)

    await sql`
      INSERT INTO caravans (origin_village_id, destination_village_id, departure_at, arrival_at, passenger_fee, guard_reward)
      VALUES (${origin.id}, ${dest.id}, ${departureAt}, ${arrivalAt}, ${Math.floor(Math.random() * 30) + 10}, ${Math.floor(Math.random() * 50) + 30})
    `
  }
}
