/**
 * NPC・評判システム
 * NPC配置・関係値・Reputation・会話テキスト生成
 */
import { sql } from '../db/client.js'

export type NpcRole =
  | 'FARMER' | 'MERCHANT' | 'BLACKSMITH' | 'KNIGHT'
  | 'MAGE' | 'DOCTOR' | 'PRIEST' | 'MONEYLENDER' | 'ELDER'

/** NPCと話す */
export async function talkToNpc(
  characterId: string,
  npcId: string
): Promise<{ text: string; questAvailable: boolean }> {
  const npc = await sql<{ id: string; name: string; role: NpcRole; villageId: string }[]>`
    SELECT id, name, role, village_id FROM npcs WHERE id = ${npcId} AND is_alive = true LIMIT 1
  `
  if (!npc[0]) return { text: 'その人物は見当たらない。', questAvailable: false }

  const relation = await sql<{ relationValue: number }[]>`
    SELECT relation_value FROM character_npc_relations
    WHERE character_id = ${characterId} AND npc_id = ${npcId}
    LIMIT 1
  `
  const relationValue = relation[0]?.relationValue ?? 0

  // 村の状態を取得
  const village = await sql<{ developmentLevel: number; currentWeather: string; securityLevel: number }[]>`
    SELECT development_level, current_weather, security_level
    FROM villages WHERE id = ${npc[0].villageId} LIMIT 1
  `
  const v = village[0]

  const text = generateNpcDialogue(npc[0].role, npc[0].name, relationValue, v)
  const questAvailable = relationValue >= 0 && Math.random() < 0.3

  return { text, questAvailable }
}

/** 善行・悪行による関係値・Reputation変化 */
export async function updateReputation(
  characterId: string,
  npcId: string | null,
  villageId: string,
  isGoodDeed: boolean,
  magnitude: 'SMALL' | 'MEDIUM' | 'LARGE'
): Promise<void> {
  const magnitudeMap = { SMALL: 5, MEDIUM: 15, LARGE: 30 }
  const change = magnitudeMap[magnitude] * (isGoodDeed ? 1 : -1)

  if (npcId) {
    await sql`
      INSERT INTO character_npc_relations (character_id, npc_id, relation_value)
      VALUES (${characterId}, ${npcId}, ${change})
      ON CONFLICT (character_id, npc_id)
      DO UPDATE SET relation_value = LEAST(100, GREATEST(-100,
        character_npc_relations.relation_value + ${change}
      ))
    `
  }

  // Village全体のReputationは characters テーブルの village_reputation で管理
  // （簡略化: character_npc_relationsの平均で代替）
}

/** Reputation確認（-50以下でMarket利用禁止） */
export async function checkVillageReputation(
  characterId: string,
  villageId: string
): Promise<{ canTrade: boolean; reputationText: string }> {
  const avg = await sql<{ avg: number }[]>`
    SELECT COALESCE(AVG(cnr.relation_value), 0) as avg
    FROM character_npc_relations cnr
    JOIN npcs n ON cnr.npc_id = n.id
    WHERE cnr.character_id = ${characterId} AND n.village_id = ${villageId}
  `
  const rep = avg[0]?.avg ?? 0
  const canTrade = rep >= -50

  let reputationText: string
  if (rep >= 50) reputationText = 'この村では英雄として慕われている'
  else if (rep >= 20) reputationText = 'この村では顔が知られている'
  else if (rep >= 0) reputationText = 'この村では普通の旅人として扱われる'
  else if (rep >= -30) reputationText = 'この村では警戒されている'
  else reputationText = 'この村では嫌われ者だ。取引を断られることがある'

  return { canTrade, reputationText }
}

function generateNpcDialogue(
  role: NpcRole,
  name: string,
  relation: number,
  village: { developmentLevel: number; currentWeather: string; securityLevel: number } | undefined
): string {
  const greeting = relation >= 50
    ? `${name}は笑顔で迎えてくれた。`
    : relation >= 0
    ? `${name}は軽く頷いた。`
    : `${name}は警戒した様子で見てきた。`

  const roleDialogue: Record<NpcRole, string> = {
    FARMER:      '「今年の作物の出来はどうかな。天気次第だね。」',
    MERCHANT:    '「何か売り買いしたいものはあるかい？」',
    BLACKSMITH:  '「武器や防具の修理なら任せてくれ。」',
    KNIGHT:      '「最近、周辺に魔物が増えている。気をつけろ。」',
    MAGE:        '「魔法に興味があるなら、魔法書を探してみるといい。」',
    DOCTOR:      '「怪我や病気があれば診てあげよう。」',
    PRIEST:      '「神の加護があなたに宿りますように。」',
    MONEYLENDER: '「資金が必要なら貸してあげよう。利子は少々いただくが。」',
    ELDER:       '「この村も長い歴史がある。昔はもっと賑やかだったがな。」',
  }

  const weatherComment = village?.currentWeather === 'STORM'
    ? '「今日は嵐だ。外出は控えた方がいい。」'
    : village?.currentWeather === 'SNOW'
    ? '「雪が降っている。農作業は難しいな。」'
    : ''

  return `${greeting} ${roleDialogue[role] ?? '「…」'} ${weatherComment}`.trim()
}
