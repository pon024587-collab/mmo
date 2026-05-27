import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Recipe {
  id: string
  resultName: string
  resultCategory: string
  goldCost: number
  requiredMaterials: { name: string; qty: number }[]
  requiredSkillGrowth: number
  description: string
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
}

interface Substat {
  type: string
  value: number
}

const SUBSTAT_LABELS: Record<string, string> = {
  ATK: '攻撃力', DEF: '防御力', MAG: '魔法力',
  HP: '最大HP', CRIT: '会心率', SPEED: '行動速度',
}

export default function CraftPanel() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [tab, setTab] = useState<'craft' | 'reroll'>('craft')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [substats, setSubstats] = useState<{ substats: Substat[]; rerollCount: number; nextRerollCost: number } | null>(null)

  useEffect(() => {
    api.get<{ success: boolean; recipes?: Recipe[] }>('/game/craft/recipes').then(r => {
      if (r.success && r.recipes) setRecipes(r.recipes)
    })
    api.get<{ success: boolean; items?: InventoryItem[] }>('/game/inventory').then(r => {
      if (r.success && r.items) setInventory(r.items)
    })
  }, [])

  const handleCraft = async (recipeId: string) => {
    setLoading(true)
    setMessage('')
    const res = await api.post<{ success: boolean; message?: string }>('/game/craft', { recipeId })
    setMessage(res.message ?? (res.success ? '作成しました。' : '失敗しました。'))
    if (res.success) {
      api.get<{ success: boolean; items?: InventoryItem[] }>('/game/inventory').then(r => {
        if (r.success && r.items) setInventory(r.items)
      })
    }
    setLoading(false)
  }

  const handleSelectItem = async (itemId: string) => {
    setSelectedItem(itemId)
    if (!itemId) { setSubstats(null); return }
    const res = await api.get<{ success: boolean; substats?: Substat[]; rerollCount?: number; nextRerollCost?: number }>(
      `/game/item/${itemId}/substats`
    )
    if (res.success) {
      setSubstats({ substats: res.substats ?? [], rerollCount: res.rerollCount ?? 0, nextRerollCost: res.nextRerollCost ?? 0 })
    }
  }

  const handleReroll = async () => {
    if (!selectedItem) return
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string; newSubstats?: Substat[]; cost?: number }>(
      '/game/reroll', { itemId: selectedItem }
    )
    setMessage(res.message ?? '')
    if (res.success && res.newSubstats) {
      setSubstats(prev => prev ? { ...prev, substats: res.newSubstats!, rerollCount: prev.rerollCount + 1, nextRerollCost: Math.floor(prev.nextRerollCost * 1.5) } : null)
    }
    setLoading(false)
  }

  const equipItems = inventory.filter(i => ['WEAPON', 'ARMOR'].includes(i.category))

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setTab('craft')} className={`flex-1 py-2 text-sm rounded ${tab === 'craft' ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
          🔨 クラフト
        </button>
        <button onClick={() => setTab('reroll')} className={`flex-1 py-2 text-sm rounded ${tab === 'reroll' ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
          🎲 サブステリロール
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm whitespace-pre-line ${message.includes('足りません') || message.includes('失敗') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {tab === 'craft' && (
        <div className="space-y-2">
          {recipes.map(r => (
            <div key={r.id} className="bg-stone-900 border border-stone-700 rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-stone-200 text-sm font-medium">{r.resultName}</span>
                <span className="text-amber-400 text-sm">{r.goldCost}G</span>
              </div>
              <p className="text-stone-500 text-xs mb-2">{r.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {r.requiredMaterials.map((m, i) => (
                  <span key={i} className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded">
                    {m.name}×{m.qty}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleCraft(r.id)}
                disabled={loading}
                className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs rounded"
              >
                作成する
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'reroll' && (
        <div className="space-y-3">
          <div>
            <label className="text-stone-400 text-sm block mb-1">装備を選択</label>
            <select
              value={selectedItem}
              onChange={e => handleSelectItem(e.target.value)}
              className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-200 text-sm"
            >
              <option value="">-- 装備を選択 --</option>
              {equipItems.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          {substats && (
            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
              <h3 className="text-stone-300 text-sm font-medium mb-3">現在のサブステータス</h3>
              {substats.substats.length === 0 ? (
                <p className="text-stone-600 text-xs">サブステータスなし（クラフト品のみ対応）</p>
              ) : (
                <div className="space-y-1 mb-3">
                  {substats.substats.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-stone-400">{SUBSTAT_LABELS[s.type] ?? s.type}</span>
                      <span className="text-amber-300">+{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-stone-700 pt-3">
                <div className="flex justify-between text-xs text-stone-500 mb-2">
                  <span>リロール回数: {substats.rerollCount}回</span>
                  <span>次のコスト: {substats.nextRerollCost}G</span>
                </div>
                <button
                  onClick={handleReroll}
                  disabled={loading}
                  className="w-full py-2 bg-purple-800 hover:bg-purple-700 disabled:opacity-40 text-white text-sm rounded"
                >
                  🎲 リロール（{substats.nextRerollCost}G）
                </button>
                <p className="text-stone-600 text-xs mt-1 text-center">※リロールするたびにコストが上がります</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
