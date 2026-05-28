/**
 * ダンジョン探索・料理・家畜・行商（簡略実装）
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'
import { giveItem } from '../character/itemService.js'
import { getPlayerCombatPower } from '../combat/combatHelper.js'

// ---- ダンジョン探索 ----

export async function exploreDungeon(
  characterId: string,
  dungeonId: string,
  floor: number = 1
): Promise<RegisterActionResult> {
  return registerAction({
    characterId,
    actionType: 'DUNGEON_EXPLORE',
    parameters: { dungeonId, floor },
    durationOverrideMinutes: 30,
  })
}

export async function completeDungeonFloor(
  characterId: string,
  dungeonId: string,
  floor: number = 1
): Promise<string> {
  // 1. キャラクターのステータス取得
  const charRows = await sql<{ health: number; level: number }[]>`
    SELECT health, level FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!charRows[0]) return 'キャラクターが見つかりません。'
  
  const stats = await getPlayerCombatPower(characterId)
  let health = charRows[0].health

  // 2. 本格的な戦闘シミュレーション（3回）
  let battleCount = 0
  let log = ''
  for (let i = 0; i < 3; i++) {
    // 敵のステータス (階層依存・2乗スケーリングで難易度急増)
    // 1F: HP800 DEF60 ATK90  /  3F: HP4700 DEF280 ATK380  /  5F: HP11000 DEF660 ATK960
    const enemyHp  = floor * 600 + Math.pow(floor, 2) * 400 + (stats.level * 10)
    const enemyAtk = floor * 40  + Math.pow(floor, 2) * 35
    const enemyDef = floor * 30  + Math.pow(floor, 2) * 30

    // プレイヤーのダメージ計算 (クリティカル・貫通考慮)
    const actualDef = Math.max(0, enemyDef - Math.max(stats.physPen, stats.magPen))
    let baseDmg = Math.max(1, stats.attack - actualDef)
    const isCrit = Math.random() < (stats.crit / 100)
    const pDmg = Math.floor(isCrit ? baseDmg * 1.5 : baseDmg)

    // 何ターンで倒せるか
    const turnsToKill = Math.ceil(enemyHp / pDmg)
    
    // 敵からのダメージ（防御力で軽減）
    const rawEnemyDmg = Math.max(1, enemyAtk - (stats.defense * 0.5))
    // 自分が先に倒す場合、受けるダメージの回数は (turnsToKill - 1)
    const damageTaken = Math.max(0, turnsToKill - 1) * rawEnemyDmg

    health -= damageTaken
    if (health <= 0) {
      break // 死亡・撤退
    }
    battleCount++
  }

  // ステータス保存
  await sql`UPDATE characters SET health = ${Math.max(0, health)} WHERE id = ${characterId}`

  if (battleCount < 3) {
    return `第${floor}層の魔物に敗北し、逃げ帰った。（HPが尽きた）`
  }

  // 3. 3連勝できたら宝箱（クリスタル）を獲得
  const templates = await sql<{ id: string }[]>`
    SELECT id FROM item_templates WHERE name = 'CRYSTAL' LIMIT 1
  `
  if (templates[0]) {
    // ランダムなサブパラメータを生成
    // 通常ステータス系 vs %系を分けて抽選（%系は稀レア扱い）
    const flatTypes    = ['ATK', 'DEF', 'HP', 'MP', 'FIRE_RES', 'WATER_RES']
    const percentTypes = ['ATK_PERCENT', 'DEF_PERCENT', 'CRIT_RATE']
    const isPercent = Math.random() < 0.3 // 30%の確率で%系
    const pool = isPercent ? percentTypes : flatTypes
    const selectedBonus = pool[Math.floor(Math.random() * pool.length)]!

    // 固定値: 1F=50〜150, 2F=100〜300, 3F=150〜450, 4F=200〜600, 5F=250〜750
    // %値  : 1F=2〜6%,  2F=4〜12%, 3F=6〜18%, 4F=8〜24%, 5F=10〜30%
    let bonusValue: number
    let label: string
    if (isPercent) {
      bonusValue = Math.floor(Math.random() * floor * 4) + floor * 2
      label = `+${bonusValue}%`
    } else {
      bonusValue = Math.floor(Math.random() * floor * 100) + floor * 50
      label = `+${bonusValue}`
    }

    const metadata = { bonus: { [selectedBonus]: bonusValue } }

    await giveItem(characterId, templates[0].id, 1, metadata)
    
    return `第${floor}層を突破し、宝箱から「クリスタル（${selectedBonus}${label}）」を手に入れた！`
  }

  return `第${floor}層を突破したが、宝箱は空だった。`
}

// ---- 料理 ----

export async function cook(
  characterId: string,
  recipeType: 'BREAD' | 'STEW' | 'HERBAL_TEA'
): Promise<RegisterActionResult> {
  const ingredients: Record<string, string[]> = {
    BREAD: ['WHEAT'],
    STEW: ['MEAT', 'CARROT'],
    HERBAL_TEA: ['HERB'],
  }
  const needed = ingredients[recipeType] ?? []

  // 英語名→日本語名のマッピング（DBが日本語化されていても対応）
  const nameAliases: Record<string, string[]> = {
    WHEAT:  ['WHEAT', '小麦'],
    MEAT:   ['MEAT',  '肉'],
    CARROT: ['CARROT', 'ニンジン'],
    HERB:   ['HERB',  '薬草'],
  }

  for (const ing of needed) {
    const aliases = nameAliases[ing] ?? [ing]
    const item = await sql<{ id: string; quantity: number }[]>`
      SELECT i.id, i.quantity FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.owner_character_id = ${characterId} AND it.name = ANY(${aliases}::text[]) LIMIT 1
    `
    if (!item[0]) {
      const label = ing === 'WHEAT' ? '小麦' : ing === 'MEAT' ? '肉' : ing === 'CARROT' ? 'ニンジン' : ing === 'HERB' ? '薬草' : ing
      return { success: false, errorCode: 'MISSING_PREREQUISITE', message: `素材が足りません：${label}` }
    }
    
    // 素材を消費する
    if (item[0].quantity > 1) {
      await sql`UPDATE items SET quantity = quantity - 1 WHERE id = ${item[0].id}`
    } else {
      await sql`DELETE FROM items WHERE id = ${item[0].id}`
    }
  }

  return registerAction({
    characterId,
    actionType: 'COOK',
    parameters: { recipeType },
    durationOverrideMinutes: 60,
  })
}

export async function completeCook(characterId: string, recipeType: string): Promise<string> {
  const skill = await sql<{ skillCookingGrowth: number; fatigueInternal: number }[]>`
    SELECT skill_cooking_growth, fatigue_internal FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const rawSkill = skill[0]?.skillCookingGrowth ?? 0
  const fatigue = Math.max(0, Math.min(100, skill[0]?.fatigueInternal ?? 0))
  const s = Math.floor(rawSkill * (1.0 - fatigue * 0.5 / 100))

  // レシピに応じた準備品名（料理済み専用アイテム）
  const outputItemName: Record<string, string> = {
    BREAD:      '焼きたてのパン',
    STEW:       '肉シチュー',
    HERBAL_TEA: '薬草茶',
  }
  const cookedName = outputItemName[recipeType] ?? '焼きたてのパン'

  const template = await sql<{ id: string }[]>`
    SELECT id FROM item_templates WHERE name = ${cookedName} LIMIT 1
  `
  if (template[0]) {
    await giveItem(characterId, template[0].id, 1, {})
  }

  await sql`
    UPDATE characters SET skill_cooking_growth = skill_cooking_growth + 1 WHERE id = ${characterId}
  `

  const qualityText = s < 50 ? 'なかなかの出来だ。' : s < 200 ? 'とても美味そうだ。' : '絶品の仕上がりだ！'
  return `${cookedName}を作った。${qualityText}`
}

// ---- 家畜 ----

export async function buyLivestock(
  characterId: string,
  animalType: 'HORSE' | 'COW' | 'SHEEP' | 'CHICKEN' | 'DOG'
): Promise<{ success: boolean; message?: string }> {
  const prices: Record<string, number> = { HORSE: 200, COW: 150, SHEEP: 80, CHICKEN: 30, DOG: 50 }
  const price = prices[animalType] ?? 100

  const char = await sql<{ gold: number; villageId: string }[]>`
    SELECT gold, village_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0] || char[0].gold < price) {
    return { success: false, message: `所持金が足りません。必要: ${price}G` }
  }

  await sql.begin(async (tx) => {
    await tx`UPDATE characters SET gold = gold - ${price}, updated_at = NOW() WHERE id = ${characterId}`
    await tx`
      INSERT INTO livestock (character_id, animal_type, village_id)
      VALUES (${characterId}, ${animalType}, ${char[0]!.villageId})
    `
  })

  return { success: true, message: `${animalType}を購入しました。` }
}

// ---- 行商 ----

export async function startTradeRoute(
  characterId: string,
  targetVillageId: string,
  itemIds: string[]
): Promise<RegisterActionResult> {
  if (itemIds.length === 0) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '運搬するアイテムを選択してください。' }
  }

  // 移動時間（荷物量に応じて増加）
  const baseDuration = 60
  const durationMinutes = baseDuration + itemIds.length * 10

  return registerAction({
    characterId,
    actionType: 'MOVE',
    parameters: { targetVillageId, tradeItemIds: itemIds },
    durationOverrideMinutes: durationMinutes,
  })
}

export async function completeMove(characterId: string, targetVillageId: string, tradeItemIds?: string[]): Promise<string> {
  const village = await sql<{ name: string }[]>`SELECT name FROM villages WHERE id = ${targetVillageId} LIMIT 1`
  if (!village[0]) return '移動に失敗しました。'

  await sql`UPDATE characters SET village_id = ${targetVillageId}, updated_at = NOW() WHERE id = ${characterId}`

  // 賞金首なら到着時に衛兵遭遇フラグを立てる
  const { triggerGuardEncounterIfWanted } = await import('../pvp/pvpService.js')
  await triggerGuardEncounterIfWanted(characterId)

  if (tradeItemIds && tradeItemIds.length > 0) {
    return `${village[0].name}に到着し、荷物を届けた。`
  }

  return `${village[0].name}に到着した。`
}

