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
  goldCost: number
  materials: { name: string; quantity: number }[]
  materialStocks: MaterialStock[]
  requiredCraftingSkill: number
  canCraft: boolean
  description: string | null
}

interface InventoryItem { id: string; name: string; category: string; quantity: number }

export default function CraftingPanel() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [tab, setTab] = useState<'craft' | 'enhance' | 'reroll'>('craft')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState('')
  const [filter, setFilter] = useState('')

  const load = () => {
    api.get<{ success: boolean; recipes?: Recipe[] }>('/game/craft/recipes').then(r => {
      if (r.success && r.recipes) setRecipes(r.recipes)
    })
    api.get<{ success: boolean; items?: InventoryItem[] }>('/game/inventory').then(r => {
      if (r.success && r.items) setInventory(r.items)
    })
  }

  useEffect(() => { load() }, [])

  const handleCraft = async (recipeId: string, name: string, goldCost: number) => {
    if (goldCost > 0 && !window.confirm(`${name}を作成します。\n費用: ${goldCost}G\nよろしいですか？`)) return
    setLoading(true)
    setMessage('')
    const res = await api.post<{ success: boolean; message?: string }>('/game/craft', { recipeId })
    setMessage(res.message ?? (res.success ? '作成しました。' : '失敗しました。'))
    if (res.success) load()
    setLoading(false)
  }

  const handleEnhance = async () => {
    if (!selectedItem) { setMessage('装備を選択してください。'); return }
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/equipment/enhance', { itemId: selectedItem })
    setMessage(res.message ?? '')
    setLoading(false)
  }

  const handleReroll = async () => {
    if (!selectedItem) { setMessage('装備を選択してください。'); return }
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/reroll', { itemId: selectedItem })
    setMessage(res.message ?? '')
    setLoading(false)
  }

  const equipItems = inventory.filter(i => ['WEAPON', 'ARMOR'].includes(i.category))
  const filtered = recipes.filter(r => !filter || r.name.includes(filter) || r.resultItemName.includes(filter))

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(['craft', 'enhance', 'reroll'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs rounded ${tab === t ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
            {t === 'craft' ? '🔨 クラフト' : t === 'enhance' ? '⬆️ 強化' : '🎲 リロール'}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded text-sm whitespace-pre-line ${message.includes('失敗') || message.includes('足りません') || message.includes('砕け') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* クラフト */}
      {tab === 'craft' && (
        <div className="space-y-2">
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="レシピを検索..."
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-200 text-sm"
          />
          {filtered.length === 0 && <p className="text-stone-600 text-sm text-center py-4">レシピがありません。</p>}
          {filtered.map(r => (
            <div key={r.id} className={`bg-stone-900 border rounded-lg p-3 ${r.canCraft ? 'border-stone-600' : 'border-stone-800 opacity-60'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-stone-200 text-sm font-medium">{r.resultItemName}</span>
                <div className="flex gap-2 text-xs">
                  {r.attackPower > 0 && <span className="text-red-400">ATK+{r.attackPower}</span>}
                  {r.defensePower > 0 && <span className="text-blue-400">DEF+{r.defensePower}</span>}
                  {r.magicPower > 0 && <span className="text-purple-400">MAG+{r.magicPower}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {r.materialStocks.map((m, i) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded ${m.enough ? 'bg-stone-700 text-stone-300' : 'bg-red-950 text-red-400'}`}>
                    {m.name}×{m.need}({m.have}所持)
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 text-xs">{r.goldCost > 0 ? `${r.goldCost}G` : '無料'}</span>
                <button
                  onClick={() => handleCraft(r.id, r.resultItemName, r.goldCost)}
                  disabled={!r.canCraft || loading}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs rounded"
                >
                  作成
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 強化 */}
      {tab === 'enhance' && (
        <div className="space-y-3">
          <div className="bg-stone-900 border border-stone-700 rounded p-3 text-xs text-stone-400 space-y-1">
            <p>+1〜+9まで強化できます。</p>
            <p>高強化ほど失敗・破壊のリスクがあります。</p>
            <p>素材（鉄鉱石→銅→銀→金→ミスリル）と金が必要です。</p>
          </div>
          <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-200 text-sm">
            <option value="">-- 強化する装備を選択 --</option>
            {equipItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <button onClick={handleEnhance} disabled={!selectedItem || loading}
            className="w-full py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-sm rounded">
            強化する
          </button>
        </div>
      )}

      {/* リロール */}
      {tab === 'reroll' && (
        <div className="space-y-3">
          <div className="bg-stone-900 border border-stone-700 rounded p-3 text-xs text-stone-400">
            <p>装備のサブステータスをランダムで振り直します。</p>
            <p>リロール回数が増えるほどコストが上がります。</p>
          </div>
          <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-200 text-sm">
            <option value="">-- リロールする装備を選択 --</option>
            {equipItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <button onClick={handleReroll} disabled={!selectedItem || loading}
            className="w-full py-2 bg-purple-800 hover:bg-purple-700 disabled:opacity-40 text-white text-sm rounded">
            🎲 サブステータスをリロール
          </button>
        </div>
      )}
    </div>
  )
}
