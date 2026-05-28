/**
 * ゲームAPIルート（完全版）
 */
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sql } from '../db/client.js'
import { getCharacterStatus } from '../character/characterService.js'
import { registerAction, getPendingResults } from '../action/actionService.js'
import { startPlow, startSow, startWater, startHarvest } from '../farming/farmingService.js'
import { startCombat, canEquip } from '../combat/combatService.js'
import { getMarketListings, sellItem, buyItem } from '../market/marketService.js'
import { talkToNpc } from '../npc/npcService.js'
import { eat, drink, sleep, nap } from '../survival/survivalService.js'
import { getAvailableSpells, castActiveSpell } from '../magic/magicService.js'
import { MONSTERS } from '../combat/combatService.js'
import { startGather } from '../mining/miningService.js'
import { buyLand, buildHouse, getHousing } from '../land/landService.js'
import { pray } from '../religion/faithService.js'
import { seekTreatment } from '../health/healthService.js'
import { getAvailableQuests, acceptQuest } from '../quest/questService.js'
import { getLifeRecords, visitGrave } from '../character/lifeRecordService.js'
import { createWill } from '../social/willService.js'
import { propose } from '../social/marriageService.js'
import { runForMayor, petition } from '../social/politicsService.js'
import { joinGuild } from '../social/guildService.js'
import { getGlobalLogs } from '../social/logService.js'
import {
  getActiveRaidBoss, attackRaidBoss, getRaidGuildRanking,
  drawRaidGacha, getMailbox, claimMailReward, getGuildContributions
} from '../social/raidService.js'
import { cook, buyLivestock, exploreDungeon } from '../social/dungeonService.js'
import { getRumorsForVillage } from '../world/rumorService.js'
import { getRecipes, craftItem as doCraftItem } from '../crafting/craftingService.js'
import { enhanceEquipment } from '../crafting/enhanceService.js'
import { rerollSubstats } from '../craft/craftService.js'
import type { ActionType } from '../action/actionTypes.js'
import type { CropType } from '../farming/farmingService.js'
import type { MonsterType } from '../combat/combatService.js'
import type { GatherType } from '../mining/miningService.js'
import type { DeityType } from '../religion/faithService.js'

export async function gameRoutes(app: FastifyInstance): Promise<void> {
  // 認証ミドルウェア
  app.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ success: false, message: '認証が必要です。' })
    }
  })

  // ---- キャラクター ----

  app.get('/api/game/character', async (request, reply) => {
    const { playerId } = request.user as { playerId: string }
    const char = await getActiveCharacter(playerId)
    if (!char) return reply.status(404).send({ success: false, message: 'キャラクターが見つかりません。' })
    const status = await getCharacterStatus(char.id)
    return reply.send({ success: true, character: status })
  })

  app.post('/api/game/character/rename', async (request, reply) => {
    const body = z.object({ name: z.string().min(1).max(20) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, message: '名前は1〜20文字で入力してください。' })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    await sql`UPDATE characters SET name = ${body.data.name}, updated_at = NOW() WHERE id = ${char.id}`
    return reply.send({ success: true, message: `名前を「${body.data.name}」に変更しました。` })
  })



  // ---- 行動（汎用） ----

  app.post('/api/game/action', async (request, reply) => {
    const { playerId } = request.user as { playerId: string }
    const body = z.object({ actionType: z.string(), parameters: z.record(z.unknown()).optional() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, message: '入力が正しくありません。' })
    const char = await getActiveCharacter(playerId)
    if (!char) return reply.status(404).send({ success: false, message: 'キャラクターが見つかりません。' })
    const result = await registerAction({ characterId: char.id, actionType: body.data.actionType as ActionType, parameters: body.data.parameters })
    return reply.status(result.success ? 201 : 409).send(result)
  })

  // ---- 農業 ----

  app.post('/api/game/farm/plow', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await startPlow(char.id))
  })

  app.post('/api/game/farm/sow', async (request, reply) => {
    const body = z.object({ cropType: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await startSow(char.id, body.data.cropType as CropType))
  })

  app.post('/api/game/farm/water', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await startWater(char.id))
  })

  app.post('/api/game/farm/harvest', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await startHarvest(char.id))
  })

  // ---- 戦闘 ----

  app.post('/api/game/combat', async (request, reply) => {
    const body = z.object({ monsterType: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await startCombat(char.id, body.data.monsterType as MonsterType))
  })

  // ---- 市場 ----

  app.get('/api/game/market', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const listings = await getMarketListings(char.villageId)
    return reply.send({ success: true, listings })
  })

  app.post('/api/game/market/sell', async (request, reply) => {
    const body = z.object({ itemId: z.string(), quantity: z.number().min(1).optional().default(1) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await sellItem(char.id, body.data.itemId, char.villageId, body.data.quantity))
  })

  app.post('/api/game/market/buy', async (request, reply) => {
    const body = z.object({ itemTemplateId: z.string(), quantity: z.number().min(1).optional().default(1) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await buyItem(char.id, body.data.itemTemplateId, char.villageId, body.data.quantity))
  })

  // ---- プレイヤーマーケット（露店） ----

  app.get('/api/game/market/player', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { getPlayerMarketListings } = await import('../market/playerMarketService.js')
    return reply.send({ success: true, listings: await getPlayerMarketListings(char.villageId), myCharacterId: char.id })
  })

  app.post('/api/game/market/player/list', async (request, reply) => {
    const body = z.object({ itemId: z.string(), price: z.number().min(1), quantity: z.number().min(1).optional().default(1) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { listPlayerItem } = await import('../market/playerMarketService.js')
    return reply.send(await listPlayerItem(char.id, char.villageId, body.data.itemId, body.data.price, body.data.quantity))
  })

  app.post('/api/game/market/player/buy', async (request, reply) => {
    const body = z.object({ listingId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { buyPlayerItem } = await import('../market/playerMarketService.js')
    return reply.send(await buyPlayerItem(char.id, body.data.listingId))
  })

  app.post('/api/game/market/player/cancel', async (request, reply) => {
    const body = z.object({ listingId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { cancelPlayerItemListing } = await import('../market/playerMarketService.js')
    return reply.send(await cancelPlayerItemListing(char.id, body.data.listingId))
  })

  // ---- NPC ----

  app.post('/api/game/npc/talk', async (request, reply) => {
    const body = z.object({ npcId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await talkToNpc(char.id, body.data.npcId))
  })

  app.get('/api/game/npc/list', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const npcs = await sql<{ id: string; name: string; role: string }[]>`
      SELECT id, name, role FROM npcs WHERE village_id = ${char.villageId} AND is_alive = true
    `
    return reply.send({ success: true, npcs })
  })

  // NPC別クエスト取得
  app.get('/api/game/npc/quests', async (request, reply) => {
    const npcId = (request.query as { npcId?: string }).npcId
    if (!npcId) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { getAvailableQuests } = await import('../quest/questService.js')
    const quests = await getAvailableQuests(char.id, npcId)
    return reply.send({ success: true, quests })
  })

  // ---- 生存 ----

  app.post('/api/game/eat', async (request, reply) => {
    const body = z.object({ itemId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await eat(char.id, body.data.itemId))
  })

  app.post('/api/game/drink', async (request, reply) => {
    const body = z.object({ itemId: z.string().optional() }).safeParse(request.body || {})
    const itemId = body.success ? body.data.itemId : undefined

    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const hasWater = await checkNearbyWaterSource(char.villageId)
    return reply.send(await drink(char.id, hasWater, itemId))
  })

  app.post('/api/game/sleep', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await sleep(char.id))
  })

  app.post('/api/game/nap', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await nap(char.id))
  })

  // ---- 採集 ----

  app.post('/api/game/gather', async (request, reply) => {
    const body = z.object({ gatherType: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await startGather(char.id, body.data.gatherType as GatherType))
  })

  // ---- 料理 ----

  app.post('/api/game/cook', async (request, reply) => {
    const body = z.object({ recipeType: z.enum(['BREAD', 'STEW', 'HERBAL_TEA']) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, message: 'レシピタイプが正しくありません。' })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await cook(char.id, body.data.recipeType))
  })

  // ---- ダンジョン探索 ----

  app.post('/api/game/dungeon', async (request, reply) => {
    const body = z.object({ floor: z.number().min(1).max(5).optional() }).safeParse(request.body || {})
    const floor = body.success && body.data.floor ? body.data.floor : 1

    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const dungeonId = char.villageId // 現在の村のダンジョンを探索
    return reply.send(await exploreDungeon(char.id, dungeonId, floor))
  })


  // ---- 魔法 ----



  app.get('/api/game/magic/spells', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { getAvailableSpells } = await import('../magic/magicService.js')
    const spells = await getAvailableSpells(char.id)
    // MP情報も合わせて返す
    const mpInfo = await sql<{ mp: number; mpMax: number }[]>`
      SELECT mp, mp_max FROM characters WHERE id = ${char.id}
    `
    return reply.send({ success: true, spells, mp: mpInfo[0]?.mp ?? 0, mpMax: mpInfo[0]?.mpMax ?? 0 })
  })

  app.post('/api/game/magic/cast', async (request, reply) => {
    const body = z.object({ spellId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { castActiveSpell } = await import('../magic/magicService.js')
    return reply.send(await castActiveSpell(char.id, body.data.spellId))
  })

  // ---- 戦闘・魔物 ----
  app.get('/api/game/monsters', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    const village = await sql<{ terrainType: string }[]>`
      SELECT terrain_type FROM villages WHERE id = ${char.villageId} LIMIT 1
    `
    const terrain = village[0]?.terrainType || 'PLAIN'

    // 現在の村の地形で出現する魔物だけに絞り込む
    type MData = { name: string; basePower: number; minCount: number; maxCount: number; elements: string[]; terrains: string[] }
    const monsterList = (Object.entries(MONSTERS) as [string, MData][])
      .filter(([, data]) => data.terrains.includes(terrain))
      .map(([key, data]) => ({
        id: key,
        name: data.name,
        basePower: data.basePower,
        minCount: data.minCount,
        maxCount: data.maxCount,
        elements: data.elements,
      }))
    
    // 難易度順にソート
    monsterList.sort((a, b) => a.basePower - b.basePower)
    
    return reply.send({ success: true, monsters: monsterList })
  })

  // ---- 土地・住居 ----

  app.get('/api/game/lands', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const lands = await sql<{ id: string; landType: string; status: string; purchasePrice: number; isOwner: boolean; housingType: string | null }[]>`
      SELECT l.id, l.land_type, l.status, l.purchase_price, (l.owner_character_id = ${char.id}) as is_owner, h.housing_type
      FROM lands l
      LEFT JOIN housings h ON h.land_id = l.id
      WHERE l.village_id = ${char.villageId}
      ORDER BY l.purchase_price ASC
    `
    return reply.send({ success: true, lands })
  })

  app.post('/api/game/land/buy', async (request, reply) => {
    const body = z.object({ landId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await buyLand(char.id, body.data.landId))
  })

  app.post('/api/game/house/build', async (request, reply) => {
    const body = z.object({ landId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await buildHouse(char.id, body.data.landId))
  })

  app.post('/api/game/house/upgrade', async (request, reply) => {
    const body = z.object({ landId: z.string(), houseType: z.enum(['NORMAL', 'RICH', 'MANSION']) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, message: '入力が正しくありません。' })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { upgradeHouse } = await import('../land/landService.js')
    return reply.send(await upgradeHouse(char.id, body.data.landId, body.data.houseType))
  })

  app.post('/api/game/land/sell', async (request, reply) => {
    const body = z.object({ landId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, message: '入力が正しくありません。' })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { sellLand } = await import('../land/landService.js')
    return reply.send(await sellLand(char.id, body.data.landId))
  })

  app.get('/api/game/house', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send({ success: true, housing: await getHousing(char.id) })
  })

  // ---- 倉庫 ----

  app.get('/api/game/storage', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { getStorageItems } = await import('../land/storageService.js')
    return reply.send(await getStorageItems(char.id))
  })

  app.post('/api/game/storage/deposit', async (request, reply) => {
    const body = z.object({ itemId: z.string(), quantity: z.number().min(1).optional().default(1) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { depositItem } = await import('../land/storageService.js')
    return reply.send(await depositItem(char.id, body.data.itemId, body.data.quantity).catch((e: Error) => ({
      success: false, message: e.message === 'STORAGE_FULL' ? '倉庫が満杯です。' : '預け入れに失敗しました。'
    })))
  })

  app.post('/api/game/storage/withdraw', async (request, reply) => {
    const body = z.object({ itemId: z.string(), quantity: z.number().min(1).optional().default(1) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { withdrawItem } = await import('../land/storageService.js')
    return reply.send(await withdrawItem(char.id, body.data.itemId, body.data.quantity))
  })

  // ---- 宗教 ----

  app.post('/api/game/pray', async (request, reply) => {
    const body = z.object({ deityType: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await pray(char.id, body.data.deityType as DeityType))
  })

  // ---- 治療 ----

  app.post('/api/game/treat', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await seekTreatment(char.id))
  })

  // ---- 税金 ----

  app.post('/api/game/tax/repay', async (request, reply) => {
    const body = z.object({ amount: z.number() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { repayTaxDebt } = await import('../economy/taxService.js')
    return reply.send(await repayTaxDebt(char.id, body.data.amount))
  })

  // ---- クラフト・強化・リロール ----

  app.get('/api/game/craft/recipes', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send({ success: true, recipes: await getRecipes(char.id) })
  })

  app.post('/api/game/craft', async (request, reply) => {
    const body = z.object({ recipeId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await doCraftItem(char.id, body.data.recipeId))
  })

  app.post('/api/game/equipment/enhance', async (request, reply) => {
    const body = z.object({ itemId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await enhanceEquipment(char.id, body.data.itemId))
  })

  app.post('/api/game/reroll', async (request, reply) => {
    const body = z.object({ itemId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await rerollSubstats(char.id, body.data.itemId))
  })

  // ---- ギルドクエスト ----

  app.get('/api/game/guild/quests', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    const { getGuildsInVillage, getDailyQuestsForCharacter } = await import('../quest/guildQuestService.js')
    const guilds = await getGuildsInVillage(char.villageId)

    if (guilds.length === 0) {
      return reply.send({ success: true, guilds: [], message: 'この村にギルドはありません。' })
    }

    const result = await Promise.all(guilds.map(async g => ({
      guildId: g.id,
      guildName: g.name,
      guildType: g.guildType,
      quests: await getDailyQuestsForCharacter(g.id, char.id),
    })))

    return reply.send({ success: true, guilds: result })
  })

  app.post('/api/game/guild/complete', async (request, reply) => {
    const body = z.object({ questId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    const { completeGuildQuest } = await import('../quest/guildQuestService.js')
    return reply.send(await completeGuildQuest(body.data.questId, char.id))
  })

  app.get('/api/game/quests', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const quests = await sql<{ id: string; title: string; description: string; status: string }[]>`
      SELECT id, title, description, status FROM quests WHERE character_id = ${char.id} AND status = 'ACTIVE'
    `
    return reply.send({ success: true, quests })
  })

  app.post('/api/game/quests/accept', async (request, reply) => {
    const body = z.object({
      npcId: z.string(),
      title: z.string(),
      description: z.string(),
      rewardGold: z.number(),
    }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await acceptQuest(char.id, body.data.npcId, body.data.title, body.data.description, body.data.rewardGold, []))
  })

  // 転生（死亡後に新キャラ作成）
  app.post('/api/game/reborn', async (request, reply) => {
    const { playerId } = request.user as { playerId: string }

    // 死亡済みキャラクターがあるか確認
    const dead = await sql<{ id: string }[]>`
      SELECT id FROM characters WHERE player_id = ${playerId} AND status = 'INACTIVE' LIMIT 1
    `
    if (!dead[0]) {
      return reply.status(400).send({ success: false, message: 'キャラクターはまだ生きています。' })
    }

    // アクティブなキャラクターがいないか確認
    const alive = await sql<{ id: string }[]>`
      SELECT id FROM characters WHERE player_id = ${playerId} AND status != 'INACTIVE' LIMIT 1
    `
    if (alive[0]) {
      return reply.status(400).send({ success: false, message: 'すでにアクティブなキャラクターがいます。' })
    }

    const { createCharacter } = await import('../character/characterService.js')
    const result = await createCharacter(playerId)

    if (!result.success) {
      return reply.status(500).send(result)
    }

    return reply.status(201).send({
      success: true,
      message: `新しい人生が始まりました。${result.nationName}の${result.villageName}に生まれました。`,
      villageName: result.villageName,
      nationName: result.nationName,
    })
  })

  app.post('/api/game/steal', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    // NPCから盗む
    const npcs = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM npcs WHERE village_id = ${char.villageId} AND is_alive = true ORDER BY RANDOM() LIMIT 1
    `
    if (!npcs[0]) return reply.send({ success: false, message: '盗む相手がいません。' })

    // 成功確率（器用さに依存）
    const charData = await sql<{ dexterityGrowth: number; nationId: string }[]>`
      SELECT dexterity_growth, nation_id FROM characters WHERE id = ${char.id} LIMIT 1
    `
    const dex = charData[0]?.dexterityGrowth ?? 0
    const successChance = 0.3 + (dex / 500)
    const success = Math.random() < successChance

    if (success) {
      const stolen = Math.floor(Math.random() * 30) + 5
      await sql`UPDATE characters SET gold = gold + ${stolen}, updated_at = NOW() WHERE id = ${char.id}`
      // 犯罪記録
      const { addBounty } = await import('../pvp/pvpService.js')
      await addBounty(char.id, 50, `${npcs[0].name}からの窃盗`)
      return reply.send({ success: true, message: `${npcs[0].name}から${stolen}Gを盗んだ。しかし賞金首になった。` })
    } else {
      // 失敗→犯罪記録＋評判低下
      const { addBounty } = await import('../pvp/pvpService.js')
      await addBounty(char.id, 30, `${npcs[0].name}への窃盗未遂`)
      return reply.send({ success: false, message: `${npcs[0].name}への盗みに失敗した。目撃されてしまった。` })
    }
  })

  app.get('/api/game/global-logs', async (request, reply) => {
    const logs = await getGlobalLogs(10)
    return reply.send({ success: true, logs })
  })

  // ---- レイドボス ----

  app.get('/api/game/raid', async (request, reply) => {
    const boss = await getActiveRaidBoss()
    return reply.send({ success: true, boss })
  })

  app.get('/api/game/raid/ranking', async (request, reply) => {
    const boss = await getActiveRaidBoss()
    if (!boss) return reply.send({ success: true, ranking: [] })
    const ranking = await getRaidGuildRanking(boss.id)
    return reply.send({ success: true, ranking })
  })

  app.post('/api/game/raid/attack', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const boss = await getActiveRaidBoss()
    if (!boss) return reply.status(400).send({ success: false, message: 'レイドボスが存在しません。' })
    const result = await attackRaidBoss(char.id, boss.id)
    return reply.send(result)
  })

  app.post('/api/game/raid/gacha', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const boss = await getActiveRaidBoss()
    const bossElement = boss?.element ?? 'FIRE'
    const guildRow = await sql<{ guildId: string }[]>`SELECT guild_id FROM guild_members WHERE character_id = ${char.id} LIMIT 1`
    const guildId = guildRow[0]?.guildId
    if (!guildId) return reply.send({ success: false, message: 'ギルドに加入していません。' })
    const result = await drawRaidGacha(char.id, guildId, bossElement)
    return reply.send(result)
  })

  app.get('/api/game/raid/gacha/tickets', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const guildRow = await sql<{ guildId: string }[]>`SELECT guild_id FROM guild_members WHERE character_id = ${char.id} LIMIT 1`
    const guildId = guildRow[0]?.guildId
    if (!guildId) return reply.send({ success: true, tickets: 0 })
    const contrib = await sql<{ raidGachaTickets: number }[]>`
      SELECT raid_gacha_tickets FROM guild_contributions
      WHERE character_id = ${char.id} AND guild_id = ${guildId} LIMIT 1
    `
    return reply.send({ success: true, tickets: contrib[0]?.raidGachaTickets ?? 0 })
  })

  // ---- メールボックス ----

  app.get('/api/game/mailbox', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const mails = await getMailbox(char.id)
    return reply.send({ success: true, mails })
  })

  app.post('/api/game/mailbox/claim', async (request, reply) => {
    const body = z.object({ mailId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await claimMailReward(char.id, body.data.mailId))
  })

  // ---- ギルド貢献度 ----

  app.get('/api/game/guild/contributions', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const guildRow = await sql<{ guildId: string }[]>`SELECT guild_id FROM guild_members WHERE character_id = ${char.id} LIMIT 1`
    const guildId = guildRow[0]?.guildId
    if (!guildId) return reply.send({ success: true, contributions: [] })
    const contributions = await getGuildContributions(guildId)
    return reply.send({ success: true, contributions })
  })


  app.get('/api/game/inventory', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const items = await sql<{ id: string; name: string; category: string; quantity: number; durability: number | null; metadata: any; properties: any }[]>`
      SELECT i.id, it.name, it.category, i.quantity, i.durability, i.metadata, it.properties
      FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.owner_character_id = ${char.id}
      ORDER BY it.category, it.name
    `
    return reply.send({ success: true, items, count: items.length, max: 30 })
  })

  app.get('/api/game/equipment', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    const eq = await sql<{
      equippedWeaponId: string | null;
      equippedArmorId: string | null;
      equippedAccessoryId: string | null;
    }[]>`SELECT equipped_weapon_id, equipped_armor_id, equipped_accessory_id FROM characters WHERE id = ${char.id} LIMIT 1`

    return reply.send({ success: true, equipment: eq[0] || {} })
  })

  app.post('/api/game/equip', async (request, reply) => {
    const body = z.object({ itemId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, message: '入力が正しくありません。' })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    const item = await sql<{ id: string; category: string; templateId: string; name: string }[]>`
      SELECT i.id, it.category, it.id as template_id, it.name
      FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${body.data.itemId} AND i.owner_character_id = ${char.id} LIMIT 1
    `
    if (!item[0]) return reply.send({ success: false, message: 'アイテムが見つかりません。' })

    const { category, templateId, name } = item[0]
    if (category !== 'WEAPON' && category !== 'ARMOR') {
      return reply.send({ success: false, message: 'このアイテムは装備できません。' })
    }

    const equipCheck = await canEquip(char.id, templateId)
    if (!equipCheck.canEquip) {
      return reply.send({ success: false, message: equipCheck.reason })
    }

    if (category === 'WEAPON') {
      await sql`UPDATE characters SET equipped_weapon_id = ${item[0].id} WHERE id = ${char.id}`
    } else if (category === 'ARMOR') {
      if (name.includes('指輪') || name.includes('首飾り')) {
        await sql`UPDATE characters SET equipped_accessory_id = ${item[0].id} WHERE id = ${char.id}`
      } else {
        await sql`UPDATE characters SET equipped_armor_id = ${item[0].id} WHERE id = ${char.id}`
      }
    }

    return reply.send({ success: true, message: `${name}を装備しました。` })
  })

  app.post('/api/game/unequip', async (request, reply) => {
    const body = z.object({ slot: z.enum(['WEAPON', 'ARMOR', 'ACCESSORY']) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    if (body.data.slot === 'WEAPON') await sql`UPDATE characters SET equipped_weapon_id = NULL WHERE id = ${char.id}`
    if (body.data.slot === 'ARMOR') await sql`UPDATE characters SET equipped_armor_id = NULL WHERE id = ${char.id}`
    if (body.data.slot === 'ACCESSORY') await sql`UPDATE characters SET equipped_accessory_id = NULL WHERE id = ${char.id}`

    return reply.send({ success: true, message: '装備を外しました。' })
  })
  app.post('/api/game/equipment/socket', async (request, reply) => {
    const body = z.object({ equipmentItemId: z.string(), crystalItemId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false, message: '入力が正しくありません。' })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })

    const eqRows = await sql<{ id: string; metadata: any }[]>`
      SELECT id, metadata FROM items WHERE id = ${body.data.equipmentItemId} AND owner_character_id = ${char.id} LIMIT 1
    `
    const cryRows = await sql<{ id: string; metadata: any; quantity: number }[]>`
      SELECT i.id, i.metadata, i.quantity FROM items i 
      JOIN item_templates it ON i.item_template_id = it.id 
      WHERE i.id = ${body.data.crystalItemId} AND i.owner_character_id = ${char.id} AND it.name = 'CRYSTAL' LIMIT 1
    `

    if (!eqRows[0] || !cryRows[0]) return reply.send({ success: false, message: '対象のアイテムが見つかりません。' })

    const eqMeta = eqRows[0].metadata || {}
    const cryMeta = cryRows[0].metadata || {}
    const maxSlots = eqMeta.slots || 0
    const crystals = eqMeta.crystals || []

    if (maxSlots === 0) return reply.send({ success: false, message: 'この装備にはスロットがありません。' })
    if (crystals.length >= maxSlots) return reply.send({ success: false, message: 'スロットに空きがありません。' })
    if (!cryMeta.bonus) return reply.send({ success: false, message: 'このクリスタルには力がありません。' })

    crystals.push(cryMeta.bonus)
    eqMeta.crystals = crystals

    await sql.begin(async tx => {
      await tx`UPDATE items SET metadata = ${eqMeta}::jsonb WHERE id = ${eqRows[0].id}`
      if (cryRows[0].quantity > 1) {
        await tx`UPDATE items SET quantity = quantity - 1 WHERE id = ${cryRows[0].id}`
      } else {
        await tx`DELETE FROM items WHERE id = ${cryRows[0].id}`
      }
    })

    return reply.send({ success: true, message: 'クリスタルを装備にはめ込みました。' })
  })

  // ---- 世界情報 ----

  app.get('/api/game/world', async (_request, reply) => {
    const nations = await sql<{ id: string; name: string }[]>`SELECT id, name FROM nations ORDER BY name`
    const villages = await sql<{ id: string; name: string; nationId: string; developmentLevel: number; currentWeather: string }[]>`
      SELECT id, name, nation_id, development_level, current_weather FROM villages WHERE is_abandoned = false
    `
    return reply.send({ success: true, nations, villages })
  })

  app.get('/api/game/village', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const village = await sql<{ id: string; name: string; developmentLevel: number; currentWeather: string; securityLevel: number; economyLevel: number; foodStock: number }[]>`
      SELECT id, name, development_level, current_weather, security_level, economy_level, food_stock
      FROM villages WHERE id = ${char.villageId} LIMIT 1
    `
    const npcs = await sql<{ id: string; name: string; role: string }[]>`
      SELECT id, name, role FROM npcs WHERE village_id = ${char.villageId} AND is_alive = true
    `
    const rumors = await getRumorsForVillage(char.villageId)
    const players = await sql<{ name: string; status: string }[]>`
      SELECT name, status FROM characters WHERE village_id = ${char.villageId} AND status != 'INACTIVE'
    `
    return reply.send({ success: true, village: village[0], npcs, rumors, players })
  })

  // ---- 結果取得 ----

  app.get('/api/game/results', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.send({ success: true, results: [] })
    return reply.send({ success: true, results: await getPendingResults(char.id) })
  })

  // ---- 人生記録・墓 ----

  app.get('/api/game/life-records', async (request, reply) => {
    const { playerId } = request.user as { playerId: string }
    return reply.send({ success: true, records: await getLifeRecords(playerId) })
  })

  app.post('/api/game/grave/visit', async (request, reply) => {
    const body = z.object({ graveId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await visitGrave(char.id, body.data.graveId))
  })

  // ---- 遺言 ----

  app.post('/api/game/will', async (request, reply) => {
    const body = z.object({ beneficiaries: z.array(z.object({ type: z.string(), id: z.string(), goldAmount: z.number().optional() })) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await createWill(char.id, body.data.beneficiaries as never))
  })

  // ---- 結婚 ----

  app.post('/api/game/propose', async (request, reply) => {
    const body = z.object({ npcId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await propose(char.id, body.data.npcId))
  })

  // ---- 政治 ----

  app.post('/api/game/politics/run-for-mayor', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await runForMayor(char.id, char.villageId))
  })

  app.post('/api/game/politics/petition', async (request, reply) => {
    const body = z.object({ content: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await petition(char.id, body.data.content))
  })

  // ---- ギルド ----

  app.post('/api/game/guild/join', async (request, reply) => {
    const body = z.object({ guildId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await joinGuild(char.id, body.data.guildId))
  })

  // ---- チャット ----
  app.get('/api/game/chat', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { getVillageChat } = await import('../social/chatService.js')
    return reply.send({ success: true, messages: await getVillageChat(char.villageId) })
  })

  app.post('/api/game/chat/send', async (request, reply) => {
    const body = z.object({ content: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { sendVillageChat } = await import('../social/chatService.js')
    return reply.send(await sendVillageChat(char.id, char.villageId, body.data.content))
  })

  // ---- デバッグ: スタックした行動を手動で復旧 ----

  app.get('/api/game/debug/recover', async (_request, reply) => {
    const { recoverStuckActions } = await import('../action/actionService.js')
    await recoverStuckActions()
    return reply.send({ success: true, message: 'スタックした行動の復旧処理を実行しました。' })
  })

}


// ---- ヘルパー ----

async function getActiveCharacter(playerId: string): Promise<{ id: string; villageId: string } | null> {
  const rows = await sql<{ id: string; villageId: string }[]>`
    SELECT id, village_id FROM characters
    WHERE player_id = ${playerId} AND status != 'INACTIVE'
    LIMIT 1
  `
  return rows[0] ?? null
}

async function checkNearbyWaterSource(villageId: string): Promise<boolean> {
  // 村に井戸があるか、または川地形かを確認
  const village = await sql<{ terrainType: string }[]>`
    SELECT terrain_type FROM villages WHERE id = ${villageId} LIMIT 1
  `
  if (village[0]?.terrainType === 'RIVER') return true

  const well = await sql<{ id: string }[]>`
    SELECT id FROM structures WHERE village_id = ${villageId} AND structure_type = 'WELL' AND is_destroyed = false LIMIT 1
  `
  return well.length > 0
}
