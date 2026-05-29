/**
 * ギルド日替わり納品クエストシステム
 */
import { sql } from '../db/client.js'

// 素材→魔物→出現地形のマッピング
const ITEM_MONSTER_HINT: Record<string, string> = {
  // Tier1
  'ゴブリンの皮':         'ゴブリン（森・山岳）',
  'スライムの皮':       'スライム（川・森・平野）',
  'コウモリの鋭牙':         'コウモリ（山岳・森）',
  '大ネズミの皮':       '大ネズミ（平野・森・砂漠）',
  'スケルトンの骨':       'スケルトン（雪原・砂漠）',
  'ゾンビの皮':         'ゾンビ（森・川沿い）',
  'ホブゴブリンの鋭牙':     'ホブゴブリン（森・山岳）',
  'コボルトの鋭牙':         'コボルト（山岳・平野）',
  '狼の皮':             '狼（雪原・森・平野）',
  '盗賊の皮':         '盗賊（森・砂漠・平野）',
  '毒蜘蛛の鋭牙':               '毒蜘蛛（森・山岳）',
  // Tier2
  'オークの鋭牙':           'オーク・オーク戦士（山岳・平野）',
  'リザードマンの皮':     'リザードマン（川・平野）',
  'ハーピーの皮':         'ハーピー（山岳・平野）',
  '大蛇の皮':             '大蛇（森・川沿い）',
  '魔犬の鋭牙':             '魔犬（山岳・砂漠）',
  'グレムリンの骨':     'グレムリン（山岳・砂漠）',
  'ミイラの皮':         'ミイラ（砂漠）',
  'ゴーレムの皮':       'ゴーレム（山岳）',
  'オーク戦士の骨':       'オーク戦士（山岳・平野）',
  // Tier3
  'トロルの皮':           'トロル（山岳・川沿い）',
  'アンデッドの骨':       'アンデッド（雪原・森）',
  'ダークエルフの骨':     'ダークエルフ（森・雪原）',
  'ダークエルフの魔核':                 'ダークエルフ・闇魔法使い（森・砂漠）',
  'グリフィンの皮':     'グリフィン（山岳・平野）',
  'バジリスクの鋭牙':       'バジリスク（砂漠・山岳）',
  'ヴァンパイアの鋭牙':     'ヴァンパイア（森・雪原）',
  'オーガの骨':           'オーガ（山岳・砂漠）',
  'キマイラの鋭牙':         'キマイラ（山岳）',
  'ウェアウルフの皮':     'ウェアウルフ（森・雪原）',
  'ガーゴイルの骨':       'ガーゴイル（山岳）',
  'サイクロプスの鋭牙':     'サイクロプス（山岳・砂漠）',
  'ゾンビナイトの骨':   'ゾンビナイト（雪原・砂漠）',
  '闇魔法使いの骨':     '闇魔法使い（森・砂漠）',
  'ストーンゴーレムの魔核': 'ストーンゴーレム（山岳）',
  'ドッペルゲンガーの骨':'ドッペルゲンガー（平野・森）',
  '暗黒騎士の皮':       '暗黒騎士（山岳・雪原）',
  // Tier4
  'フェニックスの皮':     'フェニックス（山岳・砂漠）',
  'リッチの魔核':         'リッチ（雪原・砂漠）',
  'ヒュドラの魔核':       'ヒュドラ（川沿い）',
  'ミノタウロスの鋭牙':     'ミノタウロス（山岳）',
  'ドラゴンの皮':               'ドラゴン（山岳・砂漠）',
  'ゴルゴンの魔核':   'ゴルゴン（川・山岳）',
  'ワイバーンの皮':     'ワイバーン（山岳・平野）',
  '魔王の手下の魔核':       '魔王の手下（山岳・雪原・砂漠）',
  '深淵の歩者の骨':           '深淵の歩者（雪原・川沿い）',
  'タイタンの骨':       'タイタン（山岳）',
  // Tier5
  '古竜の皮':             '古竜（山岳）※伝説級',
  '魔王の魔核':             '魔王（砂漠・山岳）※最強',
  '死神の魔核':           '死神（雪原）※最強',
  '堕天使の皮':           '堕天使（山岳・平野）※最強',
  '混沌の神の魔核':           '混沌の神（山岳・砂漠・雪原）※最強',
  // 採集・農業
  '鉄鉱石':               '採掘（山岳地帯）',
  '木材':                 '木こり（森）',
  '石材':                 '採掘（山岳地帯）',
  '薬草':                 '薬草採取（森・平野）',
  '肉':                   '狩り・釣り（森・川）',
  'ジャガイモ':           '農業（平野）',
  '小麦':                 '農業（平野）',
  'ニンジン':             '農業（平野）',
  'キャベツ':             '農業（平野）',
  'パン':                 '料理（小麦から作成）',
}

const DELIVERY_QUEST_TEMPLATES = [
  // 農作物
  { item: 'ジャガイモ',         qty: 10, gold: 30,  desc: 'ギルドの食料備蓄のためジャガイモが必要だ。' },
  { item: '小麦',               qty: 8,  gold: 35,  desc: '製粉所への納品用に小麦を集めている。' },
  { item: 'ニンジン',           qty: 10, gold: 30,  desc: '料理人が新鮮なニンジンを求めている。' },
  { item: 'キャベツ',           qty: 8,  gold: 30,  desc: '冬の保存食としてキャベツが必要だ。' },
  { item: '薬草',               qty: 5,  gold: 50,  desc: '医師が薬草を必要としている。' },
  // 素材
  { item: '鉄鉱石',             qty: 5,  gold: 60,  desc: '鍛冶屋が鉄鉱石を求めている。' },
  { item: '木材',               qty: 8,  gold: 45,  desc: '建設のために木材が必要だ。' },
  { item: '石材',               qty: 6,  gold: 40,  desc: '城壁の修繕に石材が必要だ。' },
  // 食料
  { item: '肉',                 qty: 5,  gold: 70,  desc: '宿屋の料理人が肉を求めている。' },
  { item: 'パン',               qty: 8,  gold: 50,  desc: '旅人向けの食料としてパンが必要だ。' },
  // Tier1魔物素材
  { item: 'ゴブリンの皮',       qty: 3,  gold: 80,  desc: 'ゴブリンの討伐証明として耳を持ってきてほしい。' },
  { item: 'スライムの皮',     qty: 5,  gold: 40,  desc: 'スライムの皮は薬の材料になる。' },
  { item: 'コウモリの鋭牙',       qty: 4,  gold: 50,  desc: 'コウモリの鋭牙を集めている。' },
  { item: '大ネズミの皮',     qty: 4,  gold: 45,  desc: '大ネズミの皮が必要だ。' },
  { item: 'スケルトンの骨',     qty: 3,  gold: 55,  desc: 'スケルトンの骨は魔法の素材になる。' },
  { item: 'ゾンビの皮',       qty: 3,  gold: 45,  desc: '特殊な薬の材料として必要だ。' },
  { item: 'ホブゴブリンの鋭牙',   qty: 2,  gold: 70,  desc: 'ホブゴブリンの鋭牙を求めている。' },
  { item: 'コボルトの鋭牙',       qty: 3,  gold: 60,  desc: 'コボルトの鋭牙は細工物の素材になる。' },
  { item: '狼の皮',           qty: 3,  gold: 90,  desc: '毛皮商人が狼の皮を求めている。' },
  { item: '盗賊の皮',       qty: 2,  gold: 85,  desc: '証拠品として盗賊の皮が必要だ。' },
  { item: '毒蜘蛛の鋭牙',             qty: 2,  gold: 110, desc: '解毒薬の研究に毒蜘蛛の鋭牙が必要だ。' },
  // Tier2魔物素材
  { item: 'オークの鋭牙',         qty: 2,  gold: 100, desc: 'オークの鋭牙は薬の材料になる。' },
  { item: 'リザードマンの皮',   qty: 3,  gold: 90,  desc: 'リザードマンの皮は防具の素材になる。' },
  { item: 'ハーピーの皮',       qty: 3,  gold: 85,  desc: 'ハーピーの皮を集めている。' },
  { item: '大蛇の皮',           qty: 2,  gold: 100, desc: '大蛇の皮は丈夫な革製品の素材になる。' },
  { item: '魔犬の鋭牙',           qty: 2,  gold: 110, desc: '魔犬の鋭牙は炎の魔法道具の素材になる。' },
  { item: 'グレムリンの骨',   qty: 3,  gold: 80,  desc: 'グレムリンが持っていた謎の部品が必要だ。' },
  { item: 'ミイラの皮',       qty: 3,  gold: 90,  desc: 'ミイラの皮は古代の魔法が宿っている。' },
  { item: 'ゴーレムの皮',     qty: 2,  gold: 120, desc: 'ゴーレムの皮は建築素材として使える。' },
  { item: 'オーク戦士の骨',     qty: 1,  gold: 130, desc: 'オーク戦士の骨を持ってきてほしい。' },
  // Tier3魔物素材
  { item: 'トロルの皮',         qty: 2,  gold: 120, desc: '革職人がトロルの皮を求めている。' },
  { item: 'アンデッドの骨',     qty: 3,  gold: 70,  desc: '魔法研究のためアンデッドの骨が必要だ。' },
  { item: 'ダークエルフの骨',   qty: 1,  gold: 150, desc: '武器商人がダークエルフの骨を求めている。' },
  { item: 'ダークエルフの魔核',               qty: 2,  gold: 150, desc: '魔法道具の修理にダークエルフの魔核が必要だ。' },
  { item: 'グリフィンの皮',   qty: 1,  gold: 200, desc: 'グリフィンの皮は最高級の矢の素材だ。' },
  { item: 'バジリスクの鋭牙',     qty: 1,  gold: 250, desc: 'バジリスクの鋭牙は石化魔法の素材になる。' },
  { item: 'ヴァンパイアの鋭牙',   qty: 1,  gold: 220, desc: 'ヴァンパイアの鋭牙を求めている。' },
  { item: 'オーガの骨',         qty: 1,  gold: 180, desc: 'オーガの骨は巨大な武器の素材になる。' },
  { item: 'キマイラの鋭牙',       qty: 1,  gold: 300, desc: 'キマイラの鋭牙は複合魔法道具の素材だ。' },
  { item: 'ウェアウルフの皮',   qty: 2,  gold: 200, desc: 'ウェアウルフの皮は変身魔法の素材になる。' },
  { item: 'ガーゴイルの骨',     qty: 1,  gold: 170, desc: 'ガーゴイルの骨は守護石として使われる。' },
  { item: 'サイクロプスの鋭牙',   qty: 1,  gold: 270, desc: 'サイクロプスの鋭牙は遠見魔法の素材だ。' },
  { item: 'ゾンビナイトの骨', qty: 1,  gold: 200, desc: 'ゾンビナイトの骨は呪われた防具の素材だ。' },
  { item: '闇魔法使いの骨',   qty: 1,  gold: 230, desc: '闇魔法使いの骨は闇魔法の素材になる。' },
  { item: 'ストーンゴーレムの魔核',qty: 1, gold: 320, desc: 'ストーンゴーレムの魔核石は強力な魔法道具の素材だ。' },
  { item: 'ドッペルゲンガーの骨',qty: 1,gold: 300,desc: 'ドッペルゲンガーの骨は変化魔法の素材だ。' },
  { item: '暗黒騎士の皮',     qty: 1,  gold: 370, desc: '暗黒騎士の皮は呪われた武器の素材だ。' },
  // Tier4魔物素材
  { item: 'フェニックスの皮',   qty: 1,  gold: 600, desc: 'フェニックスの皮は復活魔法の素材になる。' },
  { item: 'リッチの魔核',       qty: 1,  gold: 800, desc: 'リッチの魔核は最高級の闇魔法道具の素材だ。' },
  { item: 'ヒュドラの魔核',     qty: 1,  gold: 700, desc: 'ヒュドラの魔核は強力な毒薬の素材になる。' },
  { item: 'ミノタウロスの鋭牙',   qty: 1,  gold: 560, desc: 'ミノタウロスの鋭牙は最強の武器素材の一つだ。' },
  { item: 'ドラゴンの皮',             qty: 1,  gold: 500, desc: '伝説の防具を作るためにドラゴンの皮が必要だ。' },
  { item: 'ゴルゴンの魔核', qty: 1,  gold: 640, desc: 'ゴルゴンの目は石化魔法の最高素材だ。' },
  { item: 'ワイバーンの皮',   qty: 1,  gold: 760, desc: 'ワイバーンの皮は飛行魔法道具の素材だ。' },
  { item: '魔王の手下の魔核',     qty: 1,  gold: 840, desc: '魔王の手下の魔核は強力な魔法道具の素材だ。' },
  { item: '深淵の歩者の骨',         qty: 1,  gold: 900, desc: '深淵の歩者の骨は虚無魔法の素材になる。' },
  { item: 'タイタンの骨',     qty: 1,  gold: 800, desc: 'タイタンの骨は最強の防具素材だ。' },
  // Tier5魔物素材（超高報酬）
  { item: '古竜の皮',           qty: 1,  gold: 3000, desc: '古竜の皮は伝説の防具を作れる最高素材だ。' },
  { item: '魔王の魔核',           qty: 1,  gold: 6000, desc: '魔王の魔核は世界最強の魔法道具の素材だ。' },
  { item: '死神の魔核',         qty: 1,  gold: 4000, desc: '死神の魔核は死の魔法道具の素材だ。' },
  { item: '堕天使の皮',         qty: 1,  gold: 3600, desc: '堕天使の皮は光と闇の魔法道具の素材だ。' },
  { item: '混沌の神の魔核',         qty: 1,  gold: 10000,desc: '混沌の神から取れる結晶。究極の魔法素材だ。' },
]

export async function getOrCreateDailyQuests(guildId: string) {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]!
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
    const vHint = await getVillageHint(q.itemName)
    const baseHint = ITEM_MONSTER_HINT[q.itemName]
    
    let hint = null
    if (vHint && baseHint) {
      hint = `${vHint} / ${baseHint}`
    } else if (vHint) {
      hint = vHint
    } else if (baseHint) {
      hint = baseHint
    }
    
    return { ...q, hint, isCompleted: completedIds.has(q.id) }
  }))
  return questsWithHints
}

async function getVillageHint(itemName: string): Promise<string | null> {
  const ITEM_TERRAIN: Record<string, string[]> = {
    'ゴブリンの皮':     ['FOREST', 'MOUNTAIN'],
    'オークの鋭牙':       ['MOUNTAIN', 'PLAIN'],
    '狼の皮':         ['SNOWFIELD', 'FOREST', 'PLAIN'],
    '盗賊の皮':     ['FOREST', 'DESERT', 'PLAIN'],
    'トロルの皮':       ['MOUNTAIN', 'RIVER'],
    'ダークエルフの骨': ['FOREST', 'SNOWFIELD'],
    'ドラゴンの皮':           ['MOUNTAIN', 'DESERT'],
    'アンデッドの骨':   ['SNOWFIELD', 'FOREST'],
    'ストーンゴーレムの魔核':             ['FOREST', 'DESERT'],
    '毒蜘蛛の鋭牙':           ['FOREST', 'RIVER'],
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
    SELECT id, item_name, required_quantity, reward_gold, quest_date::text as quest_date
    FROM guild_daily_quests WHERE id = ${questId} AND is_active = true LIMIT 1
  `
  if (!quest[0]) return { success: false, message: 'クエストが見つかりません。' }

  // JST (UTC+9) で今日の日付を取得
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const today = jstNow.toISOString().split('T')[0]!
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
