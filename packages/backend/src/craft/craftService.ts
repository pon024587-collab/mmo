/**
 * クラフト・サブステータスリロールシステム
 */
import { sql } from '../db/client.js'

// サブステータスの種類
const SUBSTAT_TYPES = ['ATK', 'DEF', 'MAG', 'HP', 'CRIT', 'SPEED'] as const
type SubstatType = typeof SUBSTAT_TYPES[number]

const SUBSTAT_LABELS: Record<SubstatType, string> = {
  ATK:   '攻撃力',
  DEF:   '防御力',
  MAG:   '魔法力',
  HP:    '最大HP',
  CRIT:  '会心率',
  SPEED: '行動速度',
}

interface Substat {
  type: SubstatType
  value: number
}

/** ランダムなサブステータスを生成 */
function generateSubstats(basePower: number, count: number = 2): Substat[] {
  const substats: Substat[] = []
  const types = [...SUBSTAT_TYPES].sort(() => Math.random() - 0.5).slice(0, count)
  for (const type of types) {
    // 強さに比例した値（basePowerが高いほど高い値）
    const baseValue = Math.floor(basePower * 0.1) + Math.floor(Math.random() * basePower * 0.15)
    substats.push({ type, value: Math.max(1, baseValue) })
  }
  return substats
}

/** リロールコストを計算（強さに比例） */
function calcRerollCost(basePower: number, rerollCount: number): number {
  // 基本コスト = basePower * 2、リロール回数が増えるほど高くなる
  const base = Math.max(50, basePower * 2)
  const multiplier = Math.pow(1.5, rerollCount) // 1回目×1、2回目×1.5、3回目×2.25...
  return Math.floor(base * multiplier)
}

/** クラフトレシピ一覧を取得 */
export async function getCraftRecipes(): Promise<{
  id: string
  resultName: string
  resultCategory: string
  goldCost: number
  requiredMaterials: { name: string; qty: number }[]
  requiredSkillGrowth: number
  description: string
}[]> {
  const recipes = await sql<{
    id: string
    resultName: string
    resultCategory: string
    goldCost: number
    requiredMaterials: { name: string; qty: number }[]
    requiredSkillGrowth: number
    description: string
  }[]>`
    SELECT cr.id, it.name as result_name, it.category as result_category,
           cr.gold_cost, cr.required_materials, cr.required_skill_growth, cr.description
    FROM craft_recipes cr
    JOIN item_templates it ON cr.result_item_template_id = it.id
    ORDER BY cr.required_skill_growth ASC
  `
  return recipes
}

/** クラフト実行 */
export async function craftItem(
  characterId: string,
  recipeId: string
): Promise<{ success: boolean; message?: string; itemName?: string }> {
  const recipe = await sql<{
    id: string
    resultItemTemplateId: string
    resultName: string
    basePower: number
    goldCost: number
    requiredMaterials: { name: string; qty: number }[]
    requiredSkillGrowth: number
    attackPower: number
    defensePower: number
    magicPower: number
  }[]>`
    SELECT cr.id, cr.result_item_template_id, it.name as result_name,
           cr.gold_cost, cr.required_materials, cr.required_skill_growth,
           it.attack_power, it.defense_power, it.magic_power,
           (it.attack_power + it.defense_power + it.magic_power) as base_power
    FROM craft_recipes cr
    JOIN item_templates it ON cr.result_item_template_id = it.id
    WHERE cr.id = ${recipeId} LIMIT 1
  `
  if (!recipe[0]) return { success: false, message: 'レシピが見つかりません。' }

  const char = await sql<{ gold: number; skillCraftingGrowth: number }[]>`
    SELECT gold, skill_crafting_growth FROM characters WHERE id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, message: 'キャラクターが見つかりません。' }

  // スキル確認
  if (char[0].skillCraftingGrowth < recipe[0].requiredSkillGrowth) {
    return { success: false, message: `クラフトスキルが足りません。もっと鍛冶の経験を積んでください。` }
  }

  // 所持金確認
  if (char[0].gold < recipe[0].goldCost) {
    return { success: false, message: `所持金が足りません。必要: ${recipe[0].goldCost}G` }
  }

  // 素材確認
  for (const mat of recipe[0].requiredMaterials) {
    const items = await sql<{ count: string }[]>`
      SELECT COALESCE(SUM(i.quantity), 0) as count
      FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.owner_character_id = ${characterId} AND it.name = ${mat.name}
    `
    if (parseInt(items[0]?.count ?? '0') < mat.qty) {
      return { success: false, message: `素材が足りません: ${mat.name} × ${mat.qty}` }
    }
  }

  // インベントリ上限確認
  const invCount = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM items WHERE owner_character_id = ${characterId}
  `
  if (parseInt(invCount[0]?.count ?? '0') >= 50) {
    return { success: false, message: 'インベントリが満杯です。' }
  }

  // サブステータスを生成
  const basePower = recipe[0].basePower || 10
  const substats = generateSubstats(basePower, 2)

  await sql.begin(async (tx) => {
    // 所持金消費
    await tx`UPDATE characters SET gold = gold - ${recipe[0]!.goldCost}, updated_at = NOW() WHERE id = ${characterId}`

    // 素材消費
    for (const mat of recipe[0]!.requiredMaterials) {
      let remaining = mat.qty
      const matItems = await tx<{ id: string; quantity: number }[]>`
        SELECT i.id, i.quantity FROM items i
        JOIN item_templates it ON i.item_template_id = it.id
        WHERE i.owner_character_id = ${characterId} AND it.name = ${mat.name}
        ORDER BY i.quantity ASC
      `
      for (const item of matItems) {
        if (remaining <= 0) break
        if (item.quantity <= remaining) {
          await tx`DELETE FROM items WHERE id = ${item.id}`
          remaining -= item.quantity
        } else {
          await tx`UPDATE items SET quantity = quantity - ${remaining} WHERE id = ${item.id}`
          remaining = 0
        }
      }
    }

    // アイテム生成（サブステータス付き）
    await tx`
      INSERT INTO items (owner_character_id, item_template_id, metadata)
      VALUES (${characterId}, ${recipe[0]!.resultItemTemplateId}, ${ { substats, rerollCount: 0 } as any })
    `

    // クラフトスキル成長
    await tx`
      UPDATE characters SET skill_crafting_growth = skill_crafting_growth + ${Math.floor(Math.random() * 5) + 2}
      WHERE id = ${characterId}
    `
  })

  const substatText = substats.map(s => `${SUBSTAT_LABELS[s.type]}+${s.value}`).join('、')
  return {
    success: true,
    itemName: recipe[0].resultName,
    message: `${recipe[0].resultName}を作成した！\nサブステータス: ${substatText}`,
  }
}

/** サブステータスをリロール */
export async function rerollSubstats(
  characterId: string,
  itemId: string
): Promise<{ success: boolean; message?: string; newSubstats?: Substat[]; cost?: number }> {
  const item = await sql<{
    id: string
    metadata: { substats?: Substat[]; rerollCount?: number }
    basePower: number
    name: string
    category: string
  }[]>`
    SELECT i.id, i.metadata,
           (it.attack_power + it.defense_power + it.magic_power) as base_power,
           it.name, it.category
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.id = ${itemId} AND i.owner_character_id = ${characterId} LIMIT 1
  `
  if (!item[0]) return { success: false, message: 'アイテムが見つかりません。' }

  // 装備品のみリロール可能
  if (!['WEAPON', 'ARMOR'].includes(item[0].category)) {
    return { success: false, message: '装備品のみリロールできます。' }
  }

  const rerollCount = item[0].metadata?.rerollCount ?? 0
  const basePower = item[0].basePower || 10
  const cost = calcRerollCost(basePower, rerollCount)

  const char = await sql<{ gold: number }[]>`SELECT gold FROM characters WHERE id = ${characterId} LIMIT 1`
  if (!char[0] || char[0].gold < cost) {
    return { success: false, message: `所持金が足りません。必要: ${cost}G（${rerollCount + 1}回目）` }
  }

  // 新しいサブステータスを生成
  const newSubstats = generateSubstats(basePower, 2)
  const newMetadata = { ...item[0].metadata, substats: newSubstats, rerollCount: rerollCount + 1 }

  await sql.begin(async (tx) => {
    await tx`UPDATE characters SET gold = gold - ${cost}, updated_at = NOW() WHERE id = ${characterId}`
    await tx`UPDATE items SET metadata = ${newMetadata as any} WHERE id = ${itemId}`
  })

  const substatText = newSubstats.map(s => `${SUBSTAT_LABELS[s.type]}+${s.value}`).join('、')
  return {
    success: true,
    cost,
    newSubstats,
    message: `サブステータスをリロールした！（${cost}G消費）\n新しいサブステータス: ${substatText}`,
  }
}

/** アイテムのサブステータス情報を取得 */
export async function getItemSubstats(itemId: string): Promise<{
  substats: Substat[]
  rerollCount: number
  nextRerollCost: number
} | null> {
  const item = await sql<{
    metadata: { substats?: Substat[]; rerollCount?: number }
    basePower: number
  }[]>`
    SELECT i.metadata, (it.attack_power + it.defense_power + it.magic_power) as base_power
    FROM items i JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.id = ${itemId} LIMIT 1
  `
  if (!item[0]) return null

  const rerollCount = item[0].metadata?.rerollCount ?? 0
  const substats = item[0].metadata?.substats ?? []
  const nextRerollCost = calcRerollCost(item[0].basePower || 10, rerollCount)

  return { substats, rerollCount, nextRerollCost }
}
