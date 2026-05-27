/**
 * ギルド日替わり納品クエストシステム
 */
import { sql } from '../db/client.js'

// 納品クエストのテンプレート（アイテム名と報酬）
const DELIVERY_QUEST_TEMPLATES = [
  // 農作物
  { item: 'ジャガイモ',   qty: 10, gold: 30,  desc: 'ギルドの食料備蓄のためジャガイモが必要だ。' },
  { item: '小麦',         qty: 8,  gold: 35,  desc: '製粉所への納品用に小麦を集めている。' },
  { item: 'ニンジン',     qty: 10, gold: 30,  desc: '料理人が新鮮なニンジンを求めている。' },
  { item: 'キャベツ',     qty: 8,  gold: 30,  desc: '冬の保存食としてキャベツが必要だ。' },
  { item: '薬草',         qty: 5,  gold: 50,  desc: '医師が薬草を必要としている。' },
  // 素材
  { item: '鉄鉱石',       qty: 5,  gold: 60,  desc: '鍛冶屋が鉄鉱石を求めている。' },
  { item: '木材',         qty: 8,  gold: 45,  desc: '建設のために木材が必要だ。' },
  { item: '石材',         qty: 6,  gold: 40,  desc: '城壁の修繕に石材が必要だ。' },
  // 魔物素材
  { item: 'ゴブリンの耳', qty: 3,  gold: 80,  desc: 'ゴブリンの討伐証明として耳を持ってきてほしい。' },
  { item: 'オークの牙',   qty: 2,  gold: 100, desc: 'オークの牙は薬の材料になる。' },
  { item: '狼の毛皮',     qty: 3,  gold: 90,  desc: '毛皮商人が狼の毛皮を求めている。' },
  { item: 'アンデッドの骨', qty: 3, gold: 70, desc: '魔法研究のためアンデッドの骨が必要だ。' },
  { item: '魔石',         qty: 2,  gold: 150, desc: '魔法道具の修理に魔石が必要だ。' },
  // 食料
  { item: '肉',           qty: 5,  gold: 70,  desc: '宿屋の料理人が肉を求めている。' },
  { item: 'パン',         qty: 8,  gold: 50,  desc: '旅人向けの食料としてパンが必要だ。' },
]

/** 今日のギルドクエストを取得（なければ生成） */
export async function getOrCreateDailyQuests(guildId: string): Promise<{
  id: string
  title: string
  description: string
  itemName: string
  requiredQuantity: number
  rewardGold: number
  isCompleted: boolean
}[]> {
  const today = new Date().toISOString().split('T')[0]!

  // 今日のクエストが既にあるか確認
  const existing = await sql<{ id: string; title: string; description: string; itemName: string; requiredQuantity: number; rewardGold: number }[]>`
    SELECT id, title, description, item_name, required_quantity, reward_gold
    FROM guild_daily_quests
    WHERE guild_id = ${guildId} AND quest_date = ${today} AND is_active = true
    ORDER BY created_at ASC
  `

  if (existing.length === 0) {
    // 今日のクエストを生成（ランダムに10個選ぶ）
    const shuffled = [...DELIVERY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 10)
    for (const t of shuffled) {
      await sql`
        INSERT INTO guild_daily_quests (guild_id, quest_date, title, description, item_name, required_quantity, reward_gold)
        VALUES (
          ${guildId}, ${today},
          ${t.item + 'の納品'},
          ${t.desc},
          ${t.item}, ${t.qty}, ${t.gold}
        )
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
    isCompleted: false, // 後でキャラクターごとに確認
  }))
}

/** キャラクターの達成状況を含めてクエストを取得 */
export async function getDailyQuestsForCharacter(guildId: string, characterId: string): Promise<{
  id: string
  title: string
  description: string
  itemName: string
  requiredQuantity: number
  rewardGold: number
  isCompleted: boolean
}[]> {
  const quests = await getOrCreateDailyQuests(guildId)

  // 達成済みクエストを確認
  const completions = await sql<{ questId: string }[]>`
    SELECT quest_id FROM guild_quest_completions
    WHERE character_id = ${characterId}
      AND quest_id = ANY(${quests.map(q => q.id)})
  `
  const completedIds = new Set(completions.map(c => c.questId))

  return quests.map(q => ({
    ...q,
    isCompleted: completedIds.has(q.id),
  }))
}

/** ギルドクエストを納品して完了する */
export async function completeGuildQuest(
  questId: string,
  characterId: string
): Promise<{ success: boolean; message?: string; rewardGold?: number }> {
  // クエスト情報取得
  const quest = await sql<{ id: string; itemName: string; requiredQuantity: number; rewardGold: number; questDate: string }[]>`
    SELECT id, item_name, required_quantity, reward_gold, quest_date
    FROM guild_daily_quests WHERE id = ${questId} AND is_active = true LIMIT 1
  `
  if (!quest[0]) return { success: false, message: 'クエストが見つかりません。' }

  // 今日のクエストか確認
  const today = new Date().toISOString().split('T')[0]!
  if (quest[0].questDate !== today) {
    return { success: false, message: 'このクエストは期限切れです。' }
  }

  // 既に完了済みか確認
  const alreadyDone = await sql<{ id: string }[]>`
    SELECT id FROM guild_quest_completions
    WHERE quest_id = ${questId} AND character_id = ${characterId} LIMIT 1
  `
  if (alreadyDone[0]) return { success: false, message: 'このクエストは本日すでに完了しています。' }

  // インベントリに必要なアイテムがあるか確認
  const items = await sql<{ id: string; quantity: number }[]>`
    SELECT i.id, i.quantity
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId}
      AND it.name = ${quest[0].itemName}
    ORDER BY i.quantity DESC
  `

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  if (totalQty < quest[0].requiredQuantity) {
    return {
      success: false,
      message: `${quest[0].itemName}が足りません。必要: ${quest[0].requiredQuantity}個、所持: ${totalQty}個`,
    }
  }

  // アイテムを消費して報酬付与
  await sql.begin(async (tx) => {
    // アイテム消費
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

    // 報酬付与
    await tx`
      UPDATE characters SET gold = gold + ${quest[0]!.rewardGold}, updated_at = NOW()
      WHERE id = ${characterId}
    `

    // 完了記録
    await tx`
      INSERT INTO guild_quest_completions (quest_id, character_id)
      VALUES (${questId}, ${characterId})
    `
  })

  return {
    success: true,
    rewardGold: quest[0].rewardGold,
    message: `納品完了！${quest[0].rewardGold}Gを受け取った。`,
  }
}

/** 近くのギルド一覧を取得 */
export async function getGuildsInVillage(villageId: string): Promise<{
  id: string
  name: string
  guildType: string
}[]> {
  return sql`
    SELECT id, name, guild_type
    FROM guilds
    WHERE village_id = ${villageId}
    ORDER BY guild_type
  `
}
