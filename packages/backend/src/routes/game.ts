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
import { cook, buyLivestock, exploreDungeon } from '../social/dungeonService.js'
import { getRumorsForVillage } from '../world/rumorService.js'
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
    const body = z.object({ itemId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await sellItem(char.id, body.data.itemId, char.villageId))
  })

  app.post('/api/game/market/buy', async (request, reply) => {
    const body = z.object({ itemTemplateId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await buyItem(char.id, body.data.itemTemplateId, char.villageId))
  })

  // ---- プレイヤーマーケット（露店） ----

  app.get('/api/game/market/player', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { getPlayerMarketListings } = await import('../market/playerMarketService.js')
    return reply.send({ success: true, listings: await getPlayerMarketListings(char.villageId), myCharacterId: char.id })
  })

  app.post('/api/game/market/player/list', async (request, reply) => {
    const body = z.object({ itemId: z.string(), price: z.number().min(1) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { listPlayerItem } = await import('../market/playerMarketService.js')
    return reply.send(await listPlayerItem(char.id, char.villageId, body.data.itemId, body.data.price))
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

  // ---- 生存 ----

  app.post('/api/game/eat', async (request, reply) => {
    const body = z.object({ itemId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await eat(char.id, body.data.itemId))
  })

  app.post('/api/game/drink', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const hasWater = await checkNearbyWaterSource(char.villageId)
    return reply.send(await drink(char.id, hasWater))
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
    const monsterList = Object.entries(MONSTERS)
      .filter(([, data]) => (data as any).terrains.includes(terrain))
      .map(([key, data]) => ({
        id: key,
        name: data.name,
        basePower: data.basePower,
        minCount: data.minCount,
        maxCount: data.maxCount,
        elements: (data as any).elements,
      }))
    
    // 難易度順にソート
    monsterList.sort((a, b) => a.basePower - b.basePower)
    
    return reply.send({ success: true, monsters: monsterList })
  })

  // ---- 土地・住居 ----

  app.get('/api/game/lands', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const lands = await sql<{ id: string; landType: string; status: string; purchasePrice: number }[]>`
      SELECT id, land_type, status, purchase_price 
      FROM lands 
      WHERE village_id = ${char.villageId}
      ORDER BY purchase_price ASC
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

  app.get('/api/game/house', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send({ success: true, housing: await getHousing(char.id) })
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

  // ---- クラフト ----

  app.get('/api/game/crafting/recipes', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { getRecipes } = await import('../crafting/craftingService.js')
    const recipes = await getRecipes(char.id)
    return reply.send({ success: true, recipes })
  })

  app.post('/api/game/crafting/craft', async (request, reply) => {
    const body = z.object({ recipeId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const { craftItem } = await import('../crafting/craftingService.js')
    return reply.send(await craftItem(char.id, body.data.recipeId))
  })

  // ---- クエスト ----

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

  // ---- 犯罪 ----

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

  app.get('/api/game/inventory', async (request, reply) => {
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    const items = await sql<{ id: string; name: string; category: string; quantity: number; durability: number | null; metadata: any }[]>`
      SELECT i.id, it.name, it.category, i.quantity, i.durability, i.metadata
      FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.owner_character_id = ${char.id}
      ORDER BY it.category, it.name
    `
    return reply.send({ success: true, items, count: items.length, max: 50 })
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

  // ---- 料理・ダンジョン・家畜 ----

  app.post('/api/game/cook', async (request, reply) => {
    const body = z.object({ recipeType: z.enum(['BREAD', 'STEW', 'HERBAL_TEA']) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await cook(char.id, body.data.recipeType))
  })

  app.post('/api/game/dungeon/explore', async (request, reply) => {
    const body = z.object({ dungeonId: z.string() }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await exploreDungeon(char.id, body.data.dungeonId))
  })

  app.post('/api/game/livestock/buy', async (request, reply) => {
    const body = z.object({ animalType: z.enum(['HORSE', 'COW', 'SHEEP', 'CHICKEN', 'DOG']) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ success: false })
    const char = await getActiveCharacter((request.user as { playerId: string }).playerId)
    if (!char) return reply.status(404).send({ success: false })
    return reply.send(await buyLivestock(char.id, body.data.animalType))
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
