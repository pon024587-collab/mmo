import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

interface StorageItem {
  id: string
  name: string
  category: string
  quantity: number
  durability: number | null
  metadata: any
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  durability: number | null
}

const HOUSING_TYPE_LABEL: Record<string, string> = {
  SHACK:   '🏚️ ボロ家',
  NORMAL:  '🏠 普通の家',
  RICH:    '🏡 リッチな家',
  MANSION: '🏰 屋敷',
}

const CATEGORY_ICON: Record<string, string> = {
  FOOD:      '🍖',
  MATERIAL:  '🪨',
  WEAPON:    '⚔️',
  ARMOR:     '🛡️',
  CONSUMABLE:'💊',
  TOOL:      '🔧',
  CRYSTAL:   '💎',
  SEED:      '🌱',
  MISC:      '📦',
}

export default function StoragePanel() {
  const [tab, setTab] = useState<'storage' | 'inventory'>('storage')
  const [storageItems, setStorageItems] = useState<StorageItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [slotsUsed, setSlotsUsed] = useState(0)
  const [slotsMax, setSlotsMax] = useState(0)
  const [housingType, setHousingType] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    const [storageRes, invRes] = await Promise.all([
      api.get<{ success: boolean; items?: StorageItem[]; slotsUsed?: number; slotsMax?: number; housingType?: string; message?: string }>('/game/storage'),
      api.get<{ success: boolean; items?: InventoryItem[] }>('/game/inventory'),
    ])
    if (storageRes.success && storageRes.items != null) {
      setStorageItems(storageRes.items)
      setSlotsUsed(storageRes.slotsUsed ?? 0)
      setSlotsMax(storageRes.slotsMax ?? 0)
      setHousingType(storageRes.housingType ?? '')
    } else if (storageRes.message) {
      setMessage(storageRes.message)
      setIsError(true)
    }
    if (invRes.success && invRes.items) setInventory(invRes.items)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const showMsg = (msg: string, err = false) => {
    setMessage(msg)
    setIsError(err)
  }

  const handleDeposit = async (item: InventoryItem) => {
    const qty = quantities[`inv_${item.id}`] || 1
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/storage/deposit', { itemId: item.id, quantity: qty })
    showMsg(res.message ?? (res.success ? '預け入れました。' : '失敗しました。'), !res.success)
    if (res.success) await fetchAll()
    setLoading(false)
  }

  const handleWithdraw = async (item: StorageItem) => {
    const qty = quantities[`st_${item.id}`] || 1
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/storage/withdraw', { itemId: item.id, quantity: qty })
    showMsg(res.message ?? (res.success ? '引き出しました。' : '失敗しました。'), !res.success)
    if (res.success) await fetchAll()
    setLoading(false)
  }

  const setQty = (key: string, val: number) => {
    setQuantities(prev => ({ ...prev, [key]: val }))
  }

  const slotPct = slotsMax > 0 ? Math.round((slotsUsed / slotsMax) * 100) : 0
  const slotColor = slotPct >= 90 ? 'bg-red-500' : slotPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-amber-400 font-bold text-lg">
            🏠 住居倉庫 {housingType && <span className="text-stone-400 text-sm font-normal ml-2">{HOUSING_TYPE_LABEL[housingType] ?? housingType}</span>}
          </h2>
          <span className="text-stone-400 text-sm">{slotsUsed} / {slotsMax} スロット</span>
        </div>
        {slotsMax > 0 ? (
          <div className="w-full bg-stone-700 rounded-full h-2">
            <div className={`${slotColor} h-2 rounded-full transition-all duration-300`} style={{ width: `${slotPct}%` }} />
          </div>
        ) : (
          <p className="text-stone-500 text-sm">倉庫を使うには家をアップグレードしてください（NORMAL以上）</p>
        )}
      </div>

      {/* メッセージ */}
      {message && (
        <div className={`p-3 rounded text-sm ${isError ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'}`}>
          {message}
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('storage')}
          className={`flex-1 py-2 rounded font-bold text-sm transition-colors ${tab === 'storage' ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
        >
          📦 倉庫 ({slotsUsed})
        </button>
        <button
          onClick={() => setTab('inventory')}
          className={`flex-1 py-2 rounded font-bold text-sm transition-colors ${tab === 'inventory' ? 'bg-blue-700 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
        >
          🎒 所持品 ({inventory.length})
        </button>
      </div>

      {/* 倉庫タブ */}
      {tab === 'storage' && (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          {storageItems.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-4">倉庫は空です。</p>
          ) : (
            <div className="space-y-2">
              {storageItems.map(item => {
                const icon = CATEGORY_ICON[item.category] ?? '📦'
                return (
                  <div key={item.id} className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0">
                        <span className="text-stone-200 text-sm font-medium">{item.name}</span>
                        <span className="text-stone-500 text-xs ml-2">×{item.quantity}</span>
                        {item.durability !== null && (
                          <span className="text-stone-600 text-xs ml-1">耐久:{item.durability}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <input
                        type="number" min="1" max={item.quantity}
                        value={quantities[`st_${item.id}`] || 1}
                        onChange={e => setQty(`st_${item.id}`, Math.max(1, Math.min(item.quantity, parseInt(e.target.value) || 1)))}
                        className="w-14 bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-white text-right"
                      />
                      <button
                        onClick={() => handleWithdraw(item)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white text-xs rounded whitespace-nowrap"
                      >
                        引き出す
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* インベントリタブ */}
      {tab === 'inventory' && (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          {slotsMax === 0 ? (
            <p className="text-amber-600 text-sm text-center py-4">⚠️ 家をアップグレードすると倉庫に預けられるようになります。</p>
          ) : inventory.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-4">所持品がありません。</p>
          ) : (
            <div className="space-y-2">
              {inventory.map(item => {
                const icon = CATEGORY_ICON[item.category] ?? '📦'
                return (
                  <div key={item.id} className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0">
                        <span className="text-stone-200 text-sm font-medium">{item.name}</span>
                        <span className="text-stone-500 text-xs ml-2">×{item.quantity}</span>
                        {item.durability !== null && (
                          <span className="text-stone-600 text-xs ml-1">耐久:{item.durability}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <input
                        type="number" min="1" max={item.quantity}
                        value={quantities[`inv_${item.id}`] || 1}
                        onChange={e => setQty(`inv_${item.id}`, Math.max(1, Math.min(item.quantity, parseInt(e.target.value) || 1)))}
                        className="w-14 bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-white text-right"
                      />
                      <button
                        onClick={() => handleDeposit(item)}
                        disabled={loading || slotsUsed >= slotsMax}
                        className="px-3 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs rounded whitespace-nowrap"
                      >
                        預ける
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
