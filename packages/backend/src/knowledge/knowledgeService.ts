/**
 * 知識・書物・伝説・祭りシステム
 */
import { sql } from '../db/client.js'
import { registerAction } from '../action/actionService.js'
import type { RegisterActionResult } from '../action/actionService.js'

// ---- 知識・書物 ----

export type KnowledgeType = 'REGION' | 'MONSTER' | 'MAGIC' | 'HISTORY' | 'DREAM' | 'LEGEND'

/** 経験からKnowledgeを蓄積する */
export async function addKnowledge(
  characterId: string,
  type: KnowledgeType,
  content: string
): Promise<void> {
  await sql`
    INSERT INTO character_knowledge (character_id, knowledge_type, content)
    VALUES (${characterId}, ${type}, ${content})
    ON CONFLICT DO NOTHING
  `
}

/** 本を書く */
export async function writeBook(characterId: string): Promise<RegisterActionResult> {
  const knowledge = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM character_knowledge WHERE character_id = ${characterId}
  `
  if (parseInt(knowledge[0]?.count ?? '0') < 5) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: 'まだ書けるほどの知識がありません。もっと経験を積んでください。' }
  }
  return registerAction({ characterId, actionType: 'WRITE_BOOK', durationOverrideMinutes: 240 })
}

/** 本の執筆完了 */
export async function completeWriteBook(characterId: string): Promise<string> {
  const count = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM character_knowledge WHERE character_id = ${characterId}
  `
  const n = parseInt(count[0]?.count ?? '0')

  // 書物Itemを生成
  const template = await sql<{ id: string }[]>`
    SELECT id FROM item_templates WHERE category = 'BOOK' LIMIT 1
  `
  if (template[0]) {
    await sql`
      INSERT INTO items (owner_character_id, item_template_id, quantity, quality_internal)
      VALUES (${characterId}, ${template[0].id}, 1, ${Math.min(100, n * 5)})
    `
  }

  if (n < 20) return '薄い冊子を書き上げた。素朴な内容だが、自分の経験が詰まっている。'
  if (n < 50) return '読み応えのある本を書き上げた。'
  return '充実した内容の書物を完成させた。多くの人に読まれるだろう。'
}

/** 地図を作る */
export async function makeMap(characterId: string): Promise<RegisterActionResult> {
  const regions = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM character_knowledge
    WHERE character_id = ${characterId} AND knowledge_type = 'REGION'
  `
  if (parseInt(regions[0]?.count ?? '0') < 3) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '地図を作るには、もっと多くの場所を訪れる必要があります。' }
  }
  return registerAction({ characterId, actionType: 'MAKE_MAP', durationOverrideMinutes: 120 })
}

// ---- 伝説・神話 ----

const LEGEND_FRAGMENTS = [
  '古い石板に刻まれた文字を解読した。「太古の時代、魔王が世界を覆い尽くした…」',
  '廃墟の壁画に描かれた英雄の姿を発見した。',
  '老人が語る伝説の断片を聞いた。「封印の祭壇は北の山の奥深くにあると言われている…」',
  '古文書の一節を読んだ。「勇者は三つの試練を乗り越えて魔王を封じた…」',
  '夢の中で謎めいたビジョンを見た。古代の戦いの記憶のようだった。',
]

/** 伝説の断片を発見する（ダンジョン・遺跡探索時に呼び出す） */
export async function discoverLegendFragment(characterId: string): Promise<string | null> {
  if (Math.random() > 0.2) return null // 20%の確率

  const fragment = LEGEND_FRAGMENTS[Math.floor(Math.random() * LEGEND_FRAGMENTS.length)]!
  await addKnowledge(characterId, 'LEGEND', fragment)

  // 断片が5つ以上集まったら全容を解放
  const legendCount = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM character_knowledge
    WHERE character_id = ${characterId} AND knowledge_type = 'LEGEND'
  `
  if (parseInt(legendCount[0]?.count ?? '0') >= 5) {
    await unlockLegend(characterId)
  }

  return fragment
}

async function unlockLegend(characterId: string): Promise<void> {
  // 伝説の全容をKnowledgeに追加
  await addKnowledge(
    characterId,
    'LEGEND',
    '【伝説の全容】太古の時代、魔王ダルクが世界を闇に包んだ。勇者アルスは三つの試練を乗り越え、封印の祭壇で魔王を封じた。しかし封印は永遠ではない…'
  )
}

// ---- 季節の祭り ----

/** 祭りイベントを確認・生成する（World_Tickで季節変化時に呼び出す） */
export async function checkFestivalEvent(season: string): Promise<void> {
  const festivalNames: Record<string, string> = {
    SPRING: '春祭り',
    SUMMER: '夏の収穫祭',
    AUTUMN: '秋の感謝祭',
    WINTER: '冬の祈願祭',
  }
  const name = festivalNames[season]
  if (!name) return

  // 全Villageに祭りイベントを設定（24時間）
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await sql`
    INSERT INTO system_config (key, value)
    VALUES (${`festival_${season}`}, ${expires.toISOString()})
    ON CONFLICT (key) DO UPDATE SET value = ${expires.toISOString()}, updated_at = NOW()
  `
}

/** 祭りに参加する */
export async function attendFestival(characterId: string): Promise<RegisterActionResult> {
  const char = await sql<{ villageId: string; nationId: string }[]>`
    SELECT village_id, nation_id FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, errorCode: 'CHARACTER_INACTIVE', message: 'キャラクターが見つかりません。' }

  // 戦争中・疫病中は祭り中止
  const village = await sql<{ securityLevel: number }[]>`
    SELECT security_level FROM villages WHERE id = ${char[0].villageId} LIMIT 1
  `
  if ((village[0]?.securityLevel ?? 50) < 20) {
    return { success: false, errorCode: 'MISSING_PREREQUISITE', message: '村の状況が悪く、祭りは中止になっている。' }
  }

  return registerAction({ characterId, actionType: 'PRAY', parameters: { festival: true }, durationOverrideMinutes: 120 })
}

/** 祭り参加完了時の処理 */
export async function completeFestival(characterId: string): Promise<string> {
  // Stress大幅減少・Faith増加・Reputation増加
  await sql`
    UPDATE characters
    SET stress_internal = GREATEST(0, stress_internal - 30),
        faith = LEAST(100, faith + 10),
        updated_at = NOW()
    WHERE id = ${characterId}
  `
  // NPC全体との関係値を少し向上
  await sql`
    UPDATE character_npc_relations
    SET relation_value = LEAST(100, relation_value + 5)
    WHERE character_id = ${characterId}
  `

  const festivals = ['春祭りで踊り、歌い、村人たちと笑い合った。心が軽くなった。',
    '収穫祭で豊作を祝った。村全体が活気に満ちていた。',
    '感謝祭で神に感謝を捧げた。穏やかな気持ちになった。',
    '祈願祭で新年の平和を祈った。村人たちと絆が深まった気がする。']
  return festivals[Math.floor(Math.random() * festivals.length)]!
}
