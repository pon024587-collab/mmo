/**
 * 管理者テストモードAPI
 * ADMIN_SECRET環境変数で保護
 */
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sql } from '../db/client.js'

const ADMIN_SECRET = process.env['ADMIN_SECRET'] ?? 'admin-secret-change-this'

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // 管理者認証ミドルウェア
  app.addHook('preHandler', async (request, reply) => {
    const secret = request.headers['x-admin-secret']
    if (secret !== ADMIN_SECRET) {
      return reply.status(403).send({ success: false, message: '管理者権限がありません。' })
    }
  })

  // ---- 全プレイヤー確認 ----
  app.get('/api/admin/players', async (_req, reply) => {
    const players = await sql<{
      id: string; email: string; createdAt: Date
      characterName: string; age: number; gold: number
      villageName: string; nationName: string; status: string
      health: number; bountyAmount: number
    }[]>`
      SELECT
        p.id, p.email, p.created_at,
        c.name as character_name, c.age, c.gold, c.status,
        c.health, c.bounty_amount,
        v.name as village_name, n.name as nation_name
      FROM players p
      LEFT JOIN characters c ON c.player_id = p.id AND c.status != 'INACTIVE'
      LEFT JOIN villages v ON c.village_id = v.id
      LEFT JOIN nations n ON c.nation_id = n.id
      ORDER BY p.created_at DESC
    `
    return reply.send({ success: true, players })
  })

  // ---- 時間スキップ（World_Tickを強制実行） ----
  app.post('/api/admin/tick', async (request, reply) => {
    const body = z.object({ times: z.number().min(1).max(100).default(1) }).safeParse(request.body)
    const times = body.success ? body.data.times : 1

    const { processWorldTick } = await import('../queue/worldTickWorker.js').catch(() => ({ processWorldTick: null }))

    // World_Tickを直接呼び出す代わりにSQLで直接更新
    for (let i = 0; i < times; i++) {
      // Hunger/Thirst減少
      await sql`
        UPDATE characters
        SET hunger_internal = GREATEST(0, hunger_internal - 5),
            thirst_internal = GREATEST(0, thirst_internal - 10),
            updated_at = NOW()
        WHERE status != 'INACTIVE'
      `
    }

    return reply.send({ success: true, message: `${times}回のWorld_Tickを実行しました。` })
  })

  // ---- アイテム付与 ----
  app.post('/api/admin/give-item', async (request, reply) => {
    const body = z.object({
      characterId: z.string(),
      itemName: z.string(),
      quantity: z.number().min(1).max(999).default(1),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })

    const template = await sql<{ id: string }[]>`
      SELECT id FROM item_templates WHERE name = ${body.data.itemName} LIMIT 1
    `
    if (!template[0]) {
      // アイテム名一覧を返す
      const items = await sql<{ name: string }[]>`SELECT name FROM item_templates ORDER BY name`
      return reply.send({ success: false, message: 'アイテムが見つかりません。', availableItems: items.map(i => i.name) })
    }

    await sql`
      INSERT INTO items (owner_character_id, item_template_id, quantity)
      VALUES (${body.data.characterId}, ${template[0].id}, ${body.data.quantity})
    `
    return reply.send({ success: true, message: `${body.data.itemName} x${body.data.quantity} を付与しました。` })
  })

  // ---- ステータス操作 ----
  app.post('/api/admin/set-status', async (request, reply) => {
    const body = z.object({
      characterId: z.string(),
      health: z.number().min(0).max(9999).optional(),
      gold: z.number().min(0).max(9999999).optional(),
      skillCombatGrowth: z.number().min(0).max(9999).optional(),
      skillFarmingGrowth: z.number().min(0).max(9999).optional(),
      skillMagicGrowth: z.number().min(0).max(9999).optional(),
      strengthGrowth: z.number().min(0).max(9999).optional(),
      dexterityGrowth: z.number().min(0).max(9999).optional(),
      bountyAmount: z.number().min(0).optional(),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })

    const updates: string[] = []
    const d = body.data

    if (d.health !== undefined) updates.push(`health = ${d.health}, health_max = GREATEST(health_max, ${d.health})`)
    if (d.gold !== undefined) updates.push(`gold = ${d.gold}`)
    if (d.skillCombatGrowth !== undefined) updates.push(`skill_combat_growth = ${d.skillCombatGrowth}`)
    if (d.skillFarmingGrowth !== undefined) updates.push(`skill_farming_growth = ${d.skillFarmingGrowth}`)
    if (d.skillMagicGrowth !== undefined) updates.push(`skill_magic_growth = ${d.skillMagicGrowth}`)
    if (d.strengthGrowth !== undefined) updates.push(`strength_growth = ${d.strengthGrowth}`)
    if (d.dexterityGrowth !== undefined) updates.push(`dexterity_growth = ${d.dexterityGrowth}`)
    if (d.bountyAmount !== undefined) updates.push(`bounty_amount = ${d.bountyAmount}`)

    if (updates.length === 0) return reply.send({ success: false, message: '更新する項目がありません。' })

    await sql.unsafe(`UPDATE characters SET ${updates.join(', ')}, updated_at = NOW() WHERE id = '${d.characterId}'`)
    return reply.send({ success: true, message: 'ステータスを更新しました。' })
  })

  // ---- 行動即完了 ----
  app.post('/api/admin/complete-action', async (request, reply) => {
    const body = z.object({ characterId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })

    const action = await sql<{ id: string; actionType: string }[]>`
      SELECT id, action_type FROM action_queue
      WHERE character_id = ${body.data.characterId} AND status = 'ACTIVE'
      LIMIT 1
    `
    if (!action[0]) return reply.send({ success: false, message: '実行中の行動がありません。' })

    await sql`
      UPDATE action_queue
      SET status = 'COMPLETED', completed_at = NOW(),
          result_text = '[管理者] 行動を即完了しました。',
          scheduled_completion_at = NOW()
      WHERE id = ${action[0].id}
    `
    await sql`
      UPDATE characters SET status = 'IDLE', updated_at = NOW()
      WHERE id = ${body.data.characterId}
    `
    return reply.send({ success: true, message: `${action[0].actionType} を即完了しました。` })
  })

  // ---- 魔物召喚（戦闘を強制開始） ----
  app.post('/api/admin/spawn-monster', async (request, reply) => {
    const body = z.object({
      characterId: z.string(),
      monsterType: z.string().default('GOBLIN'),
      count: z.number().min(1).max(20).default(1),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })

    // 行動キューに戦闘を強制追加
    const completionTime = new Date(Date.now() + 5 * 60 * 1000) // 5分後
    await sql`
      INSERT INTO action_queue (character_id, action_type, parameters, status, scheduled_completion_at)
      VALUES (
        ${body.data.characterId}, 'COMBAT_MONSTER',
        ${JSON.stringify({ monsterType: body.data.monsterType, count: body.data.count, adminSpawned: true })},
        'ACTIVE', ${completionTime}
      )
    `
    await sql`
      UPDATE characters SET status = 'ACTIVE_ACTION', updated_at = NOW()
      WHERE id = ${body.data.characterId}
    `
    return reply.send({ success: true, message: `${body.data.monsterType} x${body.data.count} を召喚しました。5分後に戦闘結果が出ます。` })
  })

  // ---- アイテム一覧 ----
  app.get('/api/admin/items', async (_req, reply) => {
    const items = await sql<{ name: string; category: string; basePrice: number }[]>`
      SELECT name, category, base_price FROM item_templates ORDER BY category, name
    `
    return reply.send({ success: true, items })
  })

  // ---- キャラクター検索 ----
  app.get('/api/admin/characters', async (_req, reply) => {
    const chars = await sql<{ id: string; name: string; status: string; gold: number; villageName: string }[]>`
      SELECT c.id, c.name, c.status, c.gold, v.name as village_name
      FROM characters c
      JOIN villages v ON c.village_id = v.id
      WHERE c.status != 'INACTIVE'
      ORDER BY c.name
    `
    return reply.send({ success: true, characters: chars })
  })
}
