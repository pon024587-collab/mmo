/**
 * 社会システムAPIルート（師匠・取引・メッセージ・知識・祭り）
 */
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sql } from '../db/client.js'
import { applyForApprenticeship, receiveTraining } from '../social/mentorService.js'
import { sendTradeRequest, acceptTradeRequest, sendMessage, getUnreadMessages } from '../social/playerInteractionService.js'
import { writeBook, makeMap, attendFestival } from '../knowledge/knowledgeService.js'
import { buildBridge, buildWell } from '../world/terrainService.js'
import type { SkillType } from '../social/mentorService.js'

export async function socialRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', async (request, reply) => {
    try { await request.jwtVerify() } catch {
      return reply.status(401).send({ success: false, message: '認証が必要です。' })
    }
  })

  // ---- 師匠・弟子 ----

  app.post('/api/social/mentor/apply', async (request, reply) => {
    const body = z.object({
      mentorCharacterId: z.string().optional(),
      mentorNpcId: z.string().optional(),
      skillType: z.string(),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await applyForApprenticeship(
      char.id,
      body.data.mentorCharacterId ?? null,
      body.data.mentorNpcId ?? null,
      body.data.skillType as SkillType
    ))
  })

  app.post('/api/social/mentor/train', async (request, reply) => {
    const body = z.object({ skillType: z.string(), tuitionFee: z.number().default(0) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await receiveTraining(char.id, body.data.skillType as SkillType, body.data.tuitionFee))
  })

  // ---- プレイヤー間取引 ----

  app.post('/api/social/trade/request', async (request, reply) => {
    const body = z.object({
      targetCharacterId: z.string(),
      offerGold: z.number().default(0),
      requestGold: z.number().default(0),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await sendTradeRequest(char.id, body.data.targetCharacterId, body.data.offerGold, body.data.requestGold))
  })

  app.post('/api/social/trade/accept', async (request, reply) => {
    const body = z.object({ requestId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await acceptTradeRequest(char.id, body.data.requestId))
  })

  // ---- メッセージ ----

  app.post('/api/social/message/send', async (request, reply) => {
    const body = z.object({ receiverCharacterId: z.string(), content: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await sendMessage(char.id, body.data.receiverCharacterId, body.data.content))
  })

  app.get('/api/social/message/inbox', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.send({ success: true, messages: [] })
    return reply.send({ success: true, messages: await getUnreadMessages(char.id) })
  })

  // ---- 知識・書物 ----

  app.post('/api/social/book/write', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await writeBook(char.id))
  })

  app.post('/api/social/map/make', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await makeMap(char.id))
  })

  app.get('/api/social/knowledge', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.send({ success: true, knowledge: [] })
    const knowledge = await sql<{ knowledgeType: string; content: string; acquiredAt: Date }[]>`
      SELECT knowledge_type, content, acquired_at FROM character_knowledge
      WHERE character_id = ${char.id} ORDER BY acquired_at DESC LIMIT 50
    `
    return reply.send({ success: true, knowledge })
  })

  // ---- 祭り ----

  app.post('/api/social/festival/attend', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await attendFestival(char.id))
  })

  // ---- 建築 ----

  app.post('/api/social/build/bridge', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await buildBridge(char.id, char.villageId))
  })

  app.post('/api/social/build/well', async (request, reply) => {
    const char = await getActiveChar((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await buildWell(char.id, char.villageId))
  })
}

async function getActiveChar(playerId: string): Promise<{ id: string; villageId: string } | null> {
  const rows = await sql<{ id: string; villageId: string }[]>`
    SELECT id, village_id FROM characters
    WHERE player_id = ${playerId} AND status != 'INACTIVE' LIMIT 1
  `
  return rows[0] ?? null
}
