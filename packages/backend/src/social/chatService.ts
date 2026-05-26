import { sql } from '../db/client.js'

export async function getVillageChat(villageId: string, limit: number = 50) {
  const messages = await sql<{
    id: string
    senderId: string
    senderName: string
    content: string
    createdAt: string
  }[]>`
    SELECT 
      id,
      sender_character_id as sender_id,
      sender_name,
      content,
      created_at as created_at
    FROM village_chat_messages
    WHERE village_id = ${villageId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  // Return in chronological order
  return messages.reverse()
}

export async function sendVillageChat(characterId: string, villageId: string, content: string) {
  if (!content || content.trim() === '') {
    return { success: false, message: 'メッセージを入力してください。' }
  }

  const char = await sql<{ name: string }[]>`SELECT name FROM characters WHERE id = ${characterId}`
  if (!char[0]) {
    return { success: false, message: 'キャラクターが見つかりません。' }
  }

  await sql`
    INSERT INTO village_chat_messages (village_id, sender_character_id, sender_name, content)
    VALUES (${villageId}, ${characterId}, ${char[0].name}, ${content.trim()})
  `

  return { success: true, message: '送信しました。' }
}
