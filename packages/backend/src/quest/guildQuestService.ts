/**
 * ギルド日替わり納品クエストシステム
 */
import { sql } from '../db/client.js'

// 素材→魔物→出現地形のマッピング
const ITEM_MONSTER_HINT: Record<string, string> = {
  'ゴブリンの耳':     'ゴブリン（森・山岳地帯）',
  'オークの牙':       'オーク・オーク戦士（山岳・平野）',
  '狼の毛皮':         '狼（雪原・森・平野）',
  '盗賊のナイフ':     '盗賊（森・砂漠・平野）',
  'トロルの皮':       'トロル（山岳・川沿い）',
  'ダークエルフの弓': 'ダークエルフ（森・雪原）',
  '竜の鱗':           'ドラゴン（山岳・砂漠）※超強敵',
  'アンデッドの骨':   'アンデッド・スケルトン・ゾンビ（雪原・森）',
  '魔石':             'ダークエルフ・闇魔法使い（森・砂漠）',
  '毒の牙':           '毒蜘蛛・大蛇（森・川沿い）',
  '鉄鉱石':           '採掘（山岳地帯）',
  '木材':             '木こり（森）',
  '石材':             '採掘（山岳地帯）',
  '薬草':             '薬草採取（森・平野）',
  '肉':               '狩り・釣り（森・川）',
  'ジャガイモ':       '農業（平野）',
  '小麦':             '農業（平野）',
  'ニンジン':         '農業（平野）',
  'キャベツ':         '農業（平野）',
  'パン':             '料理（小麦から作成）',
}

const DELIVERY_QUEST_TEMPLATES = [
  { item: 'ジャガイモ',       qty: 10, gold: 30,  desc: 'ギルドの食料備蓄のためジャガイモが必要だ。' },
  { item: '小麦',             qty: 8,  gold: 35,  desc: '製粉所への納品用に小麦を集めている。' },
  { item: 'ニンジン',         qty: 10, gold: 30,  desc: '料理人が新鮮なニンジンを求めている。' },
  { item: 'キャベツ',         qty: 8,  gold: 30,  desc: '冬の保存食としてキャベツが必要だ。' },
  { item: '薬草',             qty: 5,  gold: 50,  desc: '医師が薬草を必要としている。' },
  { item: '鉄鉱石',           qty: 5,  gold: 60,  desc: '鍛冶屋が鉄鉱石を求めている。' },
  { item: '木材',             qty: 8,  gold: 45,  desc: '建設のために木材が必要だ。' },
  { item: '石材',             qty: 6,  gold: 40,  desc: '城壁の修繕に石材が必要だ。' },
  { item: '肉',               qty: 5,  gold: 70,  desc: '宿屋の料理人が肉を求めている。' },
  { item: 'パン',             qty: 8,  gold: 50,  desc: '旅人向けの食料としてパンが必要だ。' },
  { item: 'ゴブリンの耳',     qty: 3,  gold: 80,  desc: 'ゴブリンの討伐証明として耳を持ってきてほしい。' },
  { item: 'オークの牙',       qty: 2,  gold: 100, desc: 'オークの牙は薬の材料になる。' },
  { item: '狼の毛皮',         qty: 3,  gold: 90,  desc: '毛皮商人が狼の毛皮を求めている。' },
  { item: '盗賊のナイフ',     qty: 2,  gold: 85,  desc: '証拠品として盗賊のナイフが必要だ。' },
  { item: 'トロルの皮',       qty: 2,  gold: 120, desc: '革職人がトロルの皮を求めている。' },
  { item: 'ダークエルフの弓', qty: 1,  gold: 150, desc: '武器商人がダークエルフの弓を求めている。' },
  { item: '竜の鱗',           qty: 1,  gold: 500, desc: '伝説の防具を作るために竜の鱗が必要だ。' },
  { item: 'アンデッドの骨',   qty: 3,  gold: 70,  desc: '魔法研究のためアンデッドの骨が必要だ。' },
  { item: '魔石',             qty: 2,  gold: 150, desc: '魔法道具の修理に魔石が必要だ。' },
  { item: '毒の牙',           qty: 2,  gold: 110, desc: '解毒薬の研究に毒の牙が必要だ。' },
]

export async function getOrCreateDailyQuests(guildId: string) {
  const today = new Date().toISOString().split('T')[0]!
  const existing = await sql<{ id: string; title: string; description: string; itemName: string; requiredQuantity: number; rewardGold: number }[]>`
    SELECT id, title, description, item_name, required_quantity, reward_gold
    FROM guild_daily_quests
    WHERE guild_id = ${guildId} AND quest_date = ${today} AND is_active = true
    ORDER BY created_at ASC
  `
  if (existing.length === 0) {
    const shuffled = [...DELIVERY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 10)
    for (const t of shuffled) {
      await sql`
        INSERT INTO guild_daily_quests (guild_id, quest_date, title, description, item_name, required_quantity, reward_gold)
        VALUES (${guildId}, ${today}, ${t.item + 'の納品'}, ${t.desc}, ${t.item}, ${t.qty}, ${t.gold})
        ON CONFLICT (guild_id, quest_date, title) DO NOTHING
      `
    }
    return getOrCreateDailyQuests(guildId)
  }
  return existing.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    itemName: q.itemName,
    requiredQuantity: q.requiredQuantity,
    rewardGold: q.rewardGold,
    hint: ITEM_MONSTER_HINT[q.itemName] ?? null,
    isCompleted: false,
  }))
}

export async function getDailyQuestsForCharacter(guildId: string, characterId: string) {
  const quests = await getOrCreateDailyQuests(guildId)
  const completions = await sql<{ questId: string }[]>`
    SELECT quest_id FROM guild_quest_completions
    WHERE character_id = ${characterId}
      AND quest_id = ANY(${quests.map(q => q.id)})
  `
  const completedIds = new Set(completions.map(c => c.questId))
  const questsWithHints = await Promise.all(quests.map(async q => {
    const hint = await getVillageHint(q.itemName)
    return { ...q, hint, isCompleted: completedIds.has(q.id) }
  }))
  return questsWithHints
}

async function getVillageHint(itemName: string): Promise<string | null> {
  const ITEM_TERRAIN: Record<string, string[]> = {
    'ゴブリンの耳':     ['FOREST', 'MOUNTAIN'],
    'オークの牙':       ['MOUNTAIN', 'PLAIN'],
    '狼の毛皮':         ['SNOWFIELD', 'FOREST', 'PLAIN'],
    '盗賊のナイフ':     ['FOREST', 'DESERT', 'PLAIN'],
    'トロルの皮':       ['MOUNTAIN', 'RIVER'],
    'ダークエルフの弓': ['FOREST', 'SNOWFIELD'],
    '竜の鱗':           ['MOUNTAIN', 'DESERT'],
    'アンデッドの骨':   ['SNOWFIELD', 'FOREST'],
    '魔石':             ['FOREST', 'DESERT'],
    '毒の牙':           ['FOREST', 'RIVER'],
    '鉄鉱石':           ['MOUNTAIN'],
    '木材':             ['FOREST'],
    '石材':             ['MOUNTAIN'],
    '薬草':             ['FOREST', 'PLAIN'],
    '肉':               ['FOREST', 'RIVER'],
    'ジャガイモ':       ['PLAIN', 'RIVER'],
    '小麦':             ['PLAIN'],
    'ニンジン':         ['PLAIN', 'RIVER'],
    'キャベツ':         ['PLAIN'],
    'パン':             ['PLAIN'],
  }
  const terrains = ITEM_TERRAIN[itemName]
  if (!terrains) return null
  const villages = await sql<{ name: string }[]>`
    SELECT name FROM villages
    WHERE terrain_type = ANY(${terrains}) AND is_abandoned = false
    ORDER BY development_level DESC LIMIT 3
  `
  if (villages.length === 0) return null
  return villages.map(v => v.name).join('・') + ' 周辺'
}

export async function completeGuildQuest(questId: string, characterId: string): Promise<{ success: boolean; message?: string; rewardGold?: number }> {
  const quest = await sql<{ id: string; itemName: string; requiredQuantity: number; rewardGold: number; questDate: string }[]>`
    SELECT id, item_name, required_quantity, reward_gold, quest_date
    FROM guild_daily_quests WHERE id = ${questId} AND is_active = true LIMIT 1
  `
  if (!quest[0]) return { success: false, message: 'クエストが見つかりません。' }

  const today = new Date().toISOString().split('T')[0]!
  if (quest[0].questDate !== today) return { success: false, message: 'このクエストは期限切れです。' }

  const alreadyDone = await sql<{ id: string }[]>`
    SELECT id FROM guild_quest_completions WHERE quest_id = ${questId} AND character_id = ${characterId} LIMIT 1
  `
  if (alreadyDone[0]) return { success: false, message: 'このクエストは本日すでに完了しています。' }

  const items = await sql<{ id: string; quantity: number }[]>`
    SELECT i.id, i.quantity FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId} AND it.name = ${quest[0].itemName}
    ORDER BY i.quantity DESC
  `
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  if (totalQty < quest[0].requiredQuantity) {
    return { success: false, message: `${quest[0].itemName}が足りません。必要: ${quest[0].requiredQuantity}個、所持: ${totalQty}個` }
  }

  await sql.begin(async (tx) => {
    let remaining = quest[0]!.requiredQuantity
    for (const item of items) {
      if (remaining <= 0) break
      if (item.quantity <= remaining) {
        await tx`DELETE FROM items WHERE id = ${item.id}`
        remaining -= item.quantity
      } else {
        await tx`UPDATE items SET quantity = quantity - ${remaining} WHERE id = ${item.id}`
        remaining = 0
      }
    }
    await tx`UPDATE characters SET gold = gold + ${quest[0]!.rewardGold}, updated_at = NOW() WHERE id = ${characterId}`
    await tx`INSERT INTO guild_quest_completions (quest_id, character_id) VALUES (${questId}, ${characterId})`
  })

  return { success: true, rewardGold: quest[0].rewardGold, message: `納品完了！${quest[0].rewardGold}Gを受け取った。` }
}

export async function getGuildsInVillage(villageId: string) {
  return sql<{ id: string; name: string; guildType: string }[]>`
    SELECT id, name, guild_type FROM guilds WHERE village_id = ${villageId} ORDER BY guild_type
  `
}
