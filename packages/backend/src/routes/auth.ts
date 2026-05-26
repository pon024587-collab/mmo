/**
 * 認証APIルート
 */
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { register, login } from '../auth/accountManager.js'
import { createCharacter } from '../character/characterService.js'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fingerprintSignals: z.object({
    userAgent: z.string().optional(),
    screenResolution: z.string().optional(),
    timezone: z.string().optional(),
    installedFonts: z.array(z.string()).optional(),
    webglRenderer: z.string().optional(),
  }),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  fingerprintSignals: z.object({
    userAgent: z.string().optional(),
    screenResolution: z.string().optional(),
    timezone: z.string().optional(),
    installedFonts: z.array(z.string()).optional(),
    webglRenderer: z.string().optional(),
  }),
})

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // 新規登録
  app.post('/api/auth/register', async (request, reply) => {
    const body = RegisterSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, message: '入力内容が正しくありません。' })
    }

    const ipAddress = request.ip
    const result = await register({ ...body.data, ipAddress })

    if (!result.success) {
      return reply.status(409).send(result)
    }

    // キャラクター自動生成
    const charResult = await createCharacter(result.playerId!)

    // JWTトークン発行
    const token = await reply.jwtSign({ playerId: result.playerId }, { expiresIn: '30d' })

    return reply.status(201).send({
      success: true,
      token,
      character: charResult.success
        ? { villageName: charResult.villageName, nationName: charResult.nationName }
        : null,
    })
  })

  // ログイン
  app.post('/api/auth/login', async (request, reply) => {
    const body = LoginSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ success: false, message: '入力内容が正しくありません。' })
    }

    const ipAddress = request.ip
    const result = await login({ ...body.data, ipAddress })

    if (!result.success) {
      if (result.requiresVerification) {
        return reply.status(403).send(result)
      }
      return reply.status(401).send(result)
    }

    const token = await reply.jwtSign({ playerId: result.playerId }, { expiresIn: '30d' })
    return reply.send({ success: true, token })
  })
}
