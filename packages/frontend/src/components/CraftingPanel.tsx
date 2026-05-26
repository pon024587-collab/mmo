import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface MaterialStock { name: string; have: number; need: number; enough: boolean }

interface Recipe {
  id: string
  name: string
  resultItemName: string
  resultCategory: string
  attackPower: number
  defensePower: number
  magicPower: number
  materials: { name: string; quantity: number }[]
  requiredCraftingSkill: number
  description: string | null
  canCraft: boolean
  materialStocks: MaterialStock[]
}

const CATEGORY_ICON: Record<string, string> = {
  WEAPON: '⚔️',
  ARMOR: '🛡️',
}

export default function CraftingPanel() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'WEAPON' | 'ARMOR' | 'CRAFTABLE'>('ALL')
  const [loading, setLoading] = useState(false)

  const fetchRecipes = async () => {
    const res = await api.get<{ success: boolean; recipes?: Recipe[] }>('/game/crafting/recipes')
    if (res.success && res.recipes) setRecipes(res.recipes)
  }

  useEffect(() => { fetchRecipes() }, [])

  const handleCraft = async (recipeId: string) => {
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/crafting/craft', { recipeId })
    setMessage(res.message ?? '')
    if (res.success) fetchRecipes()
    setLoading(false)
  }

  const filtered = recipes.filter(r => {
    if (filter === 'ALL') return true
    if (filter === 'CRAFTABLE') return r.canCraft
    return r.resultCategory === filter
  })

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('不足') || message.includes('足りません') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* フィルター */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'CRAFTABLE', 'WEAPON', 'ARMOR'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === f ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {f === 'ALL' ? '全て' : f === 'CRAFTABLE' ? '✅ 作れる' : f === 'WEAPON' ? '⚔️ 武器' : '🛡️ 防具'}
            </button>
          ))}
        </div>
      </div>

      {/* レシピ一覧 */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-stone-500 text-sm text-center py-4">
            {filter === 'CRAFTABLE' ? '現在作れるアイテムはありません。魔物から素材を集めよう！' : 'レシピがありません。'}
          </p>
        )}
        {filtered.map(recipe => (
          <div
            key={recipe.id}
            className={`border rounded-lg p-4 ${
              recipe.canCraft
                ? 'border-amber-700 bg-amber-950/20'
                : 'border-stone-800 bg-stone-900'
            }`}
          >
            {/* ヘッダー */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-lg mr-1">{CATEGORY_ICON[recipe.resultCategory] ?? '📦'}</span>
                <span className={`font-bold ${recipe.canCraft ? 'text-amber-300' : 'text-stone-200'}`}>
                  {recipe.resultItemName}
                </span>
                {recipe.requiredCraftingSkill > 0 && (
                  <span className="text-stone-500 text-xs ml-2">要スキル: {recipe.requiredCraftingSkill}</span>
                )}
              </div>
              <button
                onClick={() => handleCraft(recipe.id)}
                disabled={!recipe.canCraft || loading}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                  recipe.canCraft && !loading
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                }`}
              >
                {loading ? '...' : '作成'}
              </button>
            </div>

            {/* ステータス */}
            <div className="flex gap-3 text-xs mb-3">
              {recipe.attackPower > 0 && <span className="text-red-400">⚔️ ATK +{recipe.attackPower}</span>}
              {recipe.defensePower > 0 && <span className="text-blue-400">🛡️ DEF +{recipe.defensePower}</span>}
              {recipe.magicPower > 0 && <span className="text-purple-400">✨ MAG +{recipe.magicPower}</span>}
            </div>

            {/* 必要素材 */}
            <div className="space-y-1">
              <p className="text-stone-500 text-xs">必要素材:</p>
              <div className="flex flex-wrap gap-2">
                {recipe.materialStocks.map(mat => (
                  <span
                    key={mat.name}
                    className={`text-xs px-2 py-0.5 rounded border ${
                      mat.enough
                        ? 'border-green-800 text-green-400 bg-green-950/30'
                        : 'border-red-900 text-red-400 bg-red-950/30'
                    }`}
                  >
                    {mat.name} {mat.have}/{mat.need}
                    {mat.enough ? ' ✓' : ' ✗'}
                  </span>
                ))}
              </div>
            </div>

            {recipe.description && (
              <p className="text-stone-500 text-xs mt-2 italic">{recipe.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
