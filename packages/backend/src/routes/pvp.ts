/**
 * PvP・商隊・賞金首APIルート
 */
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sql } from '../db/client.js'
import {
  checkGuardEncounter, fightGuard, fleeFromGuard, surrender,
  attackPlayer, completePvp, deliverPrisoner,
  getAvailableCaravans, joinCaravanAsPassenger, joinCaravanAsGuard,
  setupAmbush, addBounty,
} from '../pvp/pvpService.js'

export async function pvpRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', async (request, reply) => {
    try { await request.jwtVerify() } catch {
      return reply.status(401).send({ success: false, message: '認証が必要です。' })
    }
  })

  // ---- 衛兵遭遇 ----

  // 衛兵遭遇チェック（都市移動時に呼び出す）
  app.get('/api/pvp/guard/check', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const result = await checkGuardEncounter(char.id)
    return reply.send({ success: true, ...result })
  })

  // 衛兵と戦う
  app.post('/api/pvp/guard/fight', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await fightGuard(char.id))
  })

  // 衛兵から逃げる
  app.post('/api/pvp/guard/flee', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await fleeFromGuard(char.id))
  })

  // 自首する
  app.post('/api/pvp/guard/surrender', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const text = await surrender(char.id)
    return reply.send({ success: true, text })
  })

  // ---- PvP ----

  // プレイヤーを攻撃
  app.post('/api/pvp/attack', async (request, reply) => {
    const body = z.object({
      targetCharacterId: z.string(),
      intent: z.enum(['KILL', 'CAPTURE']),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await attackPlayer(char.id, body.data.targetCharacterId, body.data.intent))
  })

  // 囚人を引き渡す
  app.post('/api/pvp/deliver', async (request, reply) => {
    const body = z.object({ prisonerCharacterId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await deliverPrisoner(char.id, body.data.prisonerCharacterId))
  })

  // 賞金首一覧
  app.get('/api/pvp/bounties', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const bounties = await sql<{ characterName: string; bountyAmount: number; villageId: string }[]>`
      SELECT c.name as character_name, c.bounty_amount, c.village_id
      FROM characters c
      WHERE c.bounty_amount > 0 AND c.status != 'INACTIVE'
      ORDER BY c.bounty_amount DESC LIMIT 20
    `
    return reply.send({ success: true, bounties })
  })

  // 自分の囚人一覧
  app.get('/api/pvp/prisoners', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const prisoners = await sql<{ id: string; name: string; bountyAmount: number }[]>`
      SELECT c.id, c.name, c.bounty_amount
      FROM characters c
      WHERE c.captured_by = ${char.id} AND c.is_captured = true
    `
    return reply.send({ success: true, prisoners })
  })

  // ---- 商隊 ----

  // 商隊一覧
  app.get('/api/pvp/caravans', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const caravans = await getAvailableCaravans(char.villageId)
    return reply.send({ success: true, caravans })
  })

  // 乗客として参加
  app.post('/api/pvp/caravan/passenger', async (request, reply) => {
    const body = z.object({ caravanId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await joinCaravanAsPassenger(char.id, body.data.caravanId))
  })

  // 護衛として参加
  app.post('/api/pvp/caravan/guard', async (request, reply) => {
    const body = z.object({ caravanId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await joinCaravanAsGuard(char.id, body.data.caravanId))
  })

  // 道中に潜む
  app.post('/api/pvp/ambush', async (request, reply) => {
    const body = z.object({
      routeVillageA: z.string(),
      routeVillageB: z.string(),
      maxAttacks: z.number().min(1).max(10),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await setupAmbush(char.id, body.data.routeVillageA, body.data.routeVillageB, body.data.maxAttacks))
  })
}

async function getActiveChar(playerId: string): Promise<{ id: string; villageId: string } | null> {
  const rows = await sql<{ id: string; villageId: string }[]>`
    SELECT id, village_id FROM characters
    WHERE player_id = ${playerId} AND status != 'INACTIVE' LIMIT 1
  `
  return rows[0] ?? null
}
