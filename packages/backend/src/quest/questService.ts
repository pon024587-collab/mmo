/**
 * クエスト・依頼システム
 */
import { sql } from '../db/client.js'

export interface QuestCondition {
  type: 'KILL_MONSTER' | 'DELIVER_ITEM' | 'VISIT_LOCATION' | 'HARVEST_CROP'
  target: string
  amount: number
  current: number
}

/** NPCからクエストを取得する */
export async function getAvailableQuests(
  characterId: string,
  npcId: string
): Promise<{ id: string; title: string; description: string; rewardGold: number }[]> {
  const npc = await sql<{ role: string; villageId: string }[]>`
    SELECT role, village_id FROM npcs WHERE id = ${npcId} AND is_alive = true LIMIT 1
  `
  if (!npc[0]) return []

  // 既存のアクティブクエスト数確認（上限10件）
  const activeCount = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM quests
    WHERE character_id = ${characterId} AND status = 'ACTIVE'
  `
  if (parseInt(activeCount[0]?.count ?? '0') >= 10) return []

  // 村の状況に応じたクエストを生成
  const village = await sql<{ foodStock: number; securityLevel: number }[]>`
    SELECT food_stock, security_level FROM villages WHERE id = ${npc[0].villageId} LIMIT 1
  `
  const v = village[0]

  const quests: { title: string; description: string; rewardGold: number; conditions: QuestCondition[] }[] = []

  if (v && v.foodStock < 50) {
    quests.push({
      title: '食料の確保',
      description: 'ジャガイモを10個届けてほしい。村の食料が底をついてきた。',
      rewardGold: 50,
      conditions: [{ type: 'DELIVER_ITEM', target: 'POTATO', amount: 10, current: 0 }],
    })
  }

  if (v && v.securityLevel < 40) {
    quests.push({
      title: '魔物の討伐',
      description: '村の周辺にゴブリンが出没している。3体倒してほしい。',
      rewardGold: 80,
      conditions: [{ type: 'KILL_MONSTER', target: 'GOBLIN', amount: 3, current: 0 }],
    })
  }

  // デフォルトクエスト
  quests.push({
    title: '薬草の採取',
    description: '薬草を5つ持ってきてほしい。',
    rewardGold: 30,
    conditions: [{ type: 'DELIVER_ITEM', target: 'HERB', amount: 5, current: 0 }],
  })

  return quests.slice(0, 3).map((q, i) => ({
    id: `generated_${npcId}_${i}`,
    title: q.title,
    description: q.description,
    rewardGold: q.rewardGold,
  }))
}

/** クエストを受諾する */
export async function acceptQuest(
  characterId: string,
  npcId: string,
  title: string,
  description: string,
  rewardGold: number,
  conditions: QuestCondition[]
): Promise<{ success: boolean; questId?: string; message?: string }> {
  const activeCount = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM quests WHERE character_id = ${characterId} AND status = 'ACTIVE'
  `
  if (parseInt(activeCount[0]?.count ?? '0') >= 10) {
    return { success: false, message: 'クエストを10件以上同時に受けることはできません。' }
  }

  // 同じNPCから同じタイトルのクエストを既に受けていないか確認（完了済み含む）
  const duplicate = await sql<{ id: string; status: string }[]>`
    SELECT id, status FROM quests
    WHERE character_id = ${characterId}
      AND npc_id = ${npcId}
      AND title = ${title}
      AND status IN ('ACTIVE', 'COMPLETED')
      AND created_at > NOW() - INTERVAL '24 hours'
    LIMIT 1
  `
  if (duplicate[0]) {
    const msg = duplicate[0].status === 'COMPLETED'
      ? 'このクエストは本日すでに完了しています。明日また話しかけてください。'
      : 'このクエストはすでに受けています。'
    return { success: false, message: msg }
  }

  // 期限は現実72時間後
  const deadline = new Date(Date.now() + 72 * 60 * 60 * 1000)

  const [quest] = await sql<{ id: string }[]>`
    INSERT INTO quests (character_id, npc_id, title, description, conditions, reward, deadline_at)
    VALUES (
      ${characterId}, ${npcId}, ${title}, ${description},
      ${JSON.stringify(conditions)},
      ${JSON.stringify({ gold: rewardGold })},
      ${deadline}
    )
    RETURNING id
  `

  return { success: true, questId: quest!.id }
}

/** クエスト進捗を更新する */
export async function updateQuestProgress(
  characterId: string,
  eventType: QuestCondition['type'],
  target: string,
  amount: number = 1
): Promise<void> {
  const quests = await sql<{ id: string; conditions: QuestCondition[]; reward: { gold: number } }[]>`
    SELECT id, conditions, reward FROM quests
    WHERE character_id = ${characterId} AND status = 'ACTIVE'
  `

  for (const quest of quests) {
    let updated = false
    const newConditions = quest.conditions.map((c) => {
      if (c.type === eventType && c.target === target) {
        updated = true
        return { ...c, current: Math.min(c.amount, c.current + amount) }
      }
      return c
    })

    if (!updated) continue

    const allDone = newConditions.every((c) => c.current >= c.amount)

    await sql`
      UPDATE quests
      SET conditions = ${JSON.stringify(newConditions)},
          status = ${allDone ? 'COMPLETED' : 'ACTIVE'}
      WHERE id = ${quest.id}
    `

    if (allDone) {
      // 報酬付与
      await sql`
        UPDATE characters SET gold = gold + ${quest.reward.gold}, updated_at = NOW()
        WHERE id = ${characterId}
      `
    }
  }
}
