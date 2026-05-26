/**
 * プレイヤー間インタラクション
 * 取引・協力行動・メッセージ
 */
import { sql } from '../db/client.js'

/** 取引リクエストを送る */
export async function sendTradeRequest(
  requesterId: string,
  targetId: string,
  offerGold: number,
  requestGold: number
): Promise<{ success: boolean; message?: string; requestId?: string }> {
  // 同じ村にいるか確認
  const chars = await sql<{ id: string; villageId: string }[]>`
    SELECT id, village_id FROM characters
    WHERE id IN (${requesterId}, ${targetId}) AND status != 'INACTIVE'
  `
  if (chars.length < 2) return { success: false, message: '相手が見つかりません。' }
  if (chars[0]!.villageId !== chars[1]!.villageId) {
    return { success: false, message: '同じ村にいる相手とのみ取引できます。' }
  }

  const [req] = await sql<{ id: string }[]>`
    INSERT INTO trade_requests
      (requester_character_id, target_character_id, offer_gold, request_gold)
    VALUES (${requesterId}, ${targetId}, ${offerGold}, ${requestGold})
    RETURNING id
  `
  return { success: true, requestId: req!.id, message: '取引リクエストを送りました。' }
}

/** 取引リクエストを承認する */
export async function acceptTradeRequest(
  targetId: string,
  requestId: string
): Promise<{ success: boolean; message?: string }> {
  const req = await sql<{
    id: string
    requesterCharacterId: string
    offerGold: number
    requestGold: number
    status: string
  }[]>`
    SELECT id, requester_character_id, offer_gold, request_gold, status
    FROM trade_requests
    WHERE id = ${requestId} AND target_character_id = ${targetId}
      AND status = 'PENDING' AND expires_at > NOW()
    LIMIT 1
  `
  if (!req[0]) return { success: false, message: '取引リクエストが見つかりません。' }

  const requester = await sql<{ gold: number }[]>`
    SELECT gold FROM characters WHERE id = ${req[0].requesterCharacterId} LIMIT 1
  `
  const target = await sql<{ gold: number }[]>`
    SELECT gold FROM characters WHERE id = ${targetId} LIMIT 1
  `

  if (!requester[0] || requester[0].gold < req[0].offerGold) {
    return { success: false, message: '相手の所持金が足りません。' }
  }
  if (!target[0] || target[0].gold < req[0].requestGold) {
    return { success: false, message: '所持金が足りません。' }
  }

  await sql.begin(async (tx) => {
    // 所持金交換
    await tx`UPDATE characters SET gold = gold - ${req[0]!.offerGold} + ${req[0]!.requestGold} WHERE id = ${req[0]!.requesterCharacterId}`
    await tx`UPDATE characters SET gold = gold - ${req[0]!.requestGold} + ${req[0]!.offerGold} WHERE id = ${targetId}`
    await tx`UPDATE trade_requests SET status = 'ACCEPTED' WHERE id = ${requestId}`
  })

  return { success: true, message: '取引が成立しました。' }
}

/** メッセージを送る */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<{ success: boolean; message?: string }> {
  if (content.length > 500) return { success: false, message: 'メッセージは500文字以内にしてください。' }

  await sql`
    INSERT INTO player_messages (sender_character_id, receiver_character_id, content)
    VALUES (${senderId}, ${receiverId}, ${content})
  `
  return { success: true, message: 'メッセージを送りました。' }
}

/** 未読メッセージを取得する */
export async function getUnreadMessages(characterId: string): Promise<{
  id: string
  senderName: string
  content: string
  sentAt: Date
}[]> {
  const msgs = await sql<{ id: string; senderName: string; content: string; sentAt: Date }[]>`
    SELECT pm.id, c.name as sender_name, pm.content, pm.sent_at
    FROM player_messages pm
    JOIN characters c ON pm.sender_character_id = c.id
    WHERE pm.receiver_character_id = ${characterId} AND pm.is_read = false
    ORDER BY pm.sent_at ASC
  `
  // 既読にする
  if (msgs.length > 0) {
    await sql`
      UPDATE player_messages SET is_read = true
      WHERE receiver_character_id = ${characterId} AND is_read = false
    `
  }
  return msgs
}

/** 協力行動（時間短縮） */
export async function cooperate(
  characterIds: string[],
  actionType: string,
  baseMinutes: number
): Promise<number> {
  // 参加人数に応じて最大50%短縮
  const reduction = Math.min(0.5, (characterIds.length - 1) * 0.15)
  return Math.floor(baseMinutes * (1 - reduction))
}
