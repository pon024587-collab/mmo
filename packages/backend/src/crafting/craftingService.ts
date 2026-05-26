/**
 * クラフトシステム
 */
import { sql } from '../db/client.js'

interface RecipeMaterial { name: string; quantity: number }

interface Recipe {
  id: string
  name: string
  resultItemTemplateId: string
  resultItemName: string
  resultCategory: string
  attackPower: number
  defensePower: number
  magicPower: number
  materials: RecipeMaterial[]
  requiredCraftingSkill: number
  description: string | null
}

interface MaterialStock {
  name: string
  have: number
  need: number
  enough: boolean
}

export interface RecipeWithStock extends Recipe {
  canCraft: boolean
  materialStocks: MaterialStock[]
}

/** レシピ一覧を取得（所持素材の状況付き） */
export async function getRecipes(characterId: string): Promise<RecipeWithStock[]> {
  const recipes = await sql<{
    id: string
    name: string
    resultItemTemplateId: string
    resultItemName: string
    resultCategory: string
    attackPower: number
    defensePower: number
    magicPower: number
    materials: RecipeMaterial[]
    requiredCraftingSkill: number
    description: string | null
  }[]>`
    SELECT
      cr.id,
      cr.name,
      cr.result_item_template_id,
      it.name AS result_item_name,
      it.category AS result_category,
      COALESCE(it.attack_power, 0) AS attack_power,
      COALESCE(it.defense_power, 0) AS defense_power,
      COALESCE(it.magic_power, 0) AS magic_power,
      cr.materials,
      cr.required_crafting_skill,
      cr.description
    FROM crafting_recipes cr
    JOIN item_templates it ON cr.result_item_template_id = it.id
    ORDER BY cr.required_crafting_skill ASC, cr.name ASC
  `

  const char = await sql<{ skillCraftingGrowth: number; fatigueInternal: number }[]>`
    SELECT skill_crafting_growth, fatigue_internal FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const base = char[0]?.skillCraftingGrowth ?? 0; const fat = Math.max(0, Math.min(100, char[0]?.fatigueInternal ?? 0)); const craftingSkill = Math.floor(base * (1.0 - fat * 0.5 / 100));

  // 所持素材を一括取得
  const owned = await sql<{ name: string; qty: number }[]>`
    SELECT it.name, SUM(i.quantity)::INTEGER AS qty
    FROM items i
    JOIN item_templates it ON i.item_template_id = it.id
    WHERE i.owner_character_id = ${characterId}
    GROUP BY it.name
  `
  const ownedMap = new Map(owned.map(o => [o.name, o.qty]))

  return recipes.map(r => {
    const stocks: MaterialStock[] = r.materials.map((m: RecipeMaterial) => ({
      name: m.name,
      have: ownedMap.get(m.name) ?? 0,
      need: m.quantity,
      enough: (ownedMap.get(m.name) ?? 0) >= m.quantity,
    }))
    const skillOk = craftingSkill >= r.requiredCraftingSkill
    return {
      ...r,
      canCraft: skillOk && stocks.every(s => s.enough),
      materialStocks: stocks,
    }
  })
}

/** アイテムをクラフトする */
export async function craftItem(
  characterId: string,
  recipeId: string
): Promise<{ success: boolean; message?: string; itemName?: string }> {
  const recipe = await sql<{
    id: string
    name: string
    resultItemTemplateId: string
    materials: RecipeMaterial[]
    requiredCraftingSkill: number
  }[]>`
    SELECT id, name, result_item_template_id, materials, required_crafting_skill
    FROM crafting_recipes WHERE id = ${recipeId} LIMIT 1
  `
  if (!recipe[0]) return { success: false, message: 'レシピが見つかりません。' }

  const r = recipe[0]

  // スキル確認
  const char = await sql<{ skillCraftingGrowth: number; fatigueInternal: number }[]>`
    SELECT skill_crafting_growth, fatigue_internal FROM characters WHERE id = ${characterId} LIMIT 1
  `
  const base = char[0]?.skillCraftingGrowth ?? 0; const fat = Math.max(0, Math.min(100, char[0]?.fatigueInternal ?? 0)); const skill = Math.floor(base * (1.0 - fat * 0.5 / 100));
  if (skill < r.requiredCraftingSkill) {
    return {
      success: false,
      message: `工作スキルが足りません。（必要: ${r.requiredCraftingSkill} / 現在: ${skill}）`,
    }
  }

  // 素材確認と消費
  for (const mat of r.materials as RecipeMaterial[]) {
    const stock = await sql<{ id: string; quantity: number }[]>`
      SELECT i.id, i.quantity
      FROM items i
      JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.owner_character_id = ${characterId} AND it.name = ${mat.name}
      ORDER BY i.quantity ASC
    `
    const totalHave = stock.reduce((sum, s) => sum + s.quantity, 0)
    if (totalHave < mat.quantity) {
      return {
        success: false,
        message: `素材が不足しています: ${mat.name} (必要${mat.quantity}個, 所持${totalHave}個)`,
      }
    }

    // 素材を消費
    let remaining = mat.quantity
    for (const s of stock) {
      if (remaining <= 0) break
      if (s.quantity <= remaining) {
        await sql`DELETE FROM items WHERE id = ${s.id}`
        remaining -= s.quantity
      } else {
        await sql`UPDATE items SET quantity = quantity - ${remaining} WHERE id = ${s.id}`
        remaining = 0
      }
    }
  }

  // 完成品を追加
  const resultTemplate = await sql<{ id: string; name: string; category: string }[]>`
    SELECT id, name, category FROM item_templates WHERE id = ${r.resultItemTemplateId} LIMIT 1
  `
  if (!resultTemplate[0]) return { success: false, message: 'クラフト結果の登録に失敗しました。' }

  const cat = resultTemplate[0].category
  let metadata: Record<string, any> = {}
  
  if (cat === 'WEAPON' || cat === 'ARMOR') {
    const r = Math.random()
    if (r < 0.001) {
      metadata.slots = 2
    } else if (r < 0.1) {
      metadata.slots = 1
    }
  }

  await sql`
    INSERT INTO items (owner_character_id, item_template_id, quantity, metadata)
    VALUES (${characterId}, ${r.resultItemTemplateId}, 1, ${JSON.stringify(metadata)}::jsonb)
  `

  // 工作スキル成長
  const skillGain = Math.max(5, Math.floor(r.requiredCraftingSkill / 10))
  await sql`
    UPDATE characters SET skill_crafting_growth = skill_crafting_growth + ${skillGain}
    WHERE id = ${characterId}
  `

  return {
    success: true,
    message: `「${resultTemplate[0].name}」を作成した！工作スキルが上がった。`,
    itemName: resultTemplate[0].name,
  }
}
