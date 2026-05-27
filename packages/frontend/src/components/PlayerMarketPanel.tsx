import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface MarketListing {
  id: string
  sellerId: string
  sellerName: string
  price: number
  itemId: string
  itemName: string
  category: string
  metadata: {
    rarity?: 'NORMAL' | 'MAGIC' | 'RARE' | 'EPIC' | 'LEGENDARY'
    prefix?: string
    suffix?: string
    bonusStrength?: number
    bonusDexterity?: number
  }
  quantity: number
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  metadata: any
}

const RARITY_STYLE: Record<string, { color: string; label: string }> = {
  NORMAL:    { color: 'text-stone-200',  label: '' },
  MAGIC:     { color: 'text-blue-400',   label: '✦' },
  RARE:      { color: 'text-yellow-300', label: '★' },
  EPIC:      { color: 'text-purple-400', label: '◆' },
  LEGENDARY: { color: 'text-orange-400', label: '🔥' },
}

export default function PlayerMarketPanel() {
  const [listings, setListings] = useState<MarketListing[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [message, setMessage] = useState('')
  const [listPrice, setListPrice] = useState<string>('')
  const [listQuantity, setListQuantity] = useState<string>('1')
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'BUY' | 'SELL'>('BUY')
  const [myId, setMyId] = useState<string>('')

  const fetchData = async () => {
    const resM = await api.get<{ success: boolean; listings?: MarketListing[]; myCharacterId?: string }>('/game/market/player')
    if (resM.success && resM.listings) {
      setListings(resM.listings)
      if (resM.myCharacterId) setMyId(resM.myCharacterId)
    }

    const resI = await api.get<{ success: boolean; items?: InventoryItem[] }>('/game/inventory')
    if (resI.success && resI.items) setInventory(resI.items)
  }

  useEffect(() => { fetchData() }, [])

  const handleBuy = async (listingId: string) => {
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/market/player/buy', { listingId })
    setMessage(res.message ?? '')
    if (res.success) fetchData()
    setLoading(false)
  }

  const handleList = async () => {
    if (!selectedItem || !listPrice || isNaN(Number(listPrice))) return
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/market/player/list', { 
      itemId: selectedItem, 
      price: Number(listPrice),
      quantity: Number(listQuantity)
    })
    setMessage(res.message ?? '')
    if (res.success) {
      setSelectedItem('')
      setListPrice('')
      setListQuantity('1')
      fetchData()
    }
    setLoading(false)
  }

  const handleCancel = async (listingId: string) => {
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/market/player/cancel', { listingId })
    setMessage(res.message ?? '')
    if (res.success) fetchData()
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('失敗') || message.includes('できません') || message.includes('不足') || message.includes('最大') || message.includes('家を持っていません') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setView('BUY')}
          className={`flex-1 py-2 rounded font-bold ${view === 'BUY' ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}
        >
          🛒 買う
        </button>
        <button 
          onClick={() => setView('SELL')}
          className={`flex-1 py-2 rounded font-bold ${view === 'SELL' ? 'bg-blue-700 text-white' : 'bg-stone-800 text-stone-400'}`}
        >
          🏪 出品する
        </button>
      </div>

      {view === 'BUY' ? (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <h2 className="text-amber-400 font-bold mb-3">プレイヤー露店</h2>
          {listings.length === 0 && <p className="text-stone-500 text-sm">現在出品されているアイテムはありません。</p>}
          <div className="space-y-2">
            {listings.map(l => {
              const rStyle = RARITY_STYLE[l.metadata?.rarity ?? 'NORMAL']
              const fullName = l.metadata?.rarity && l.metadata.rarity !== 'NORMAL'
                ? `${l.metadata.prefix ?? ''}${l.itemName}${l.metadata.suffix ?? ''}`
                : l.itemName
              const hasBonus = (l.metadata?.bonusStrength ?? 0) > 0 || (l.metadata?.bonusDexterity ?? 0) > 0

              return (
                <div key={l.id} className="border border-stone-800 rounded p-3 bg-stone-950 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-stone-500 mb-1">出品者: {l.sellerName}</div>
                    <div className="flex items-center gap-2">
                      <span className={`${rStyle?.color ?? 'text-stone-200'} font-bold text-sm`}>
                        {rStyle?.label} {fullName}
                      </span>
                      <span className="text-stone-400 text-xs">×{l.quantity}</span>
                    </div>
                    {hasBonus && (
                      <div className="mt-1 flex gap-3 text-xs text-stone-400">
                        {(l.metadata?.bonusStrength ?? 0) > 0 && <span className="text-red-400">筋力 +{l.metadata.bonusStrength}</span>}
                        {(l.metadata?.bonusDexterity ?? 0) > 0 && <span className="text-green-400">器用さ +{l.metadata.bonusDexterity}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold mb-1">{l.price} G</div>
                    <button
                      onClick={() => handleBuy(l.id)}
                      disabled={loading}
                      className="px-4 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded"
                    >
                      購入
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
            <h2 className="text-blue-400 font-bold mb-3">🏪 新規出品</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-stone-400 text-xs mb-1">出品するアイテム</label>
                <select 
                  className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-sm text-stone-200"
                  value={selectedItem}
                  onChange={e => setSelectedItem(e.target.value)}
                >
                  <option value="">-- 選択してください --</option>
                  {inventory.filter(i => i.quantity > 0).map(i => {
                    const rStyle = RARITY_STYLE[i.metadata?.rarity ?? 'NORMAL']
                    const fullName = i.metadata?.rarity && i.metadata.rarity !== 'NORMAL'
                      ? `${i.metadata.prefix ?? ''}${i.name}${i.metadata.suffix ?? ''}`
                      : i.name
                    return (
                      <option key={i.id} value={i.id}>{fullName} (残り{i.quantity}個)</option>
                    )
                  })}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-stone-400 text-xs mb-1">個数</label>
                  <input 
                    type="number"
                    min="1"
                    max={inventory.find(i => i.id === selectedItem)?.quantity || 1}
                    className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-sm text-stone-200"
                    value={listQuantity}
                    onChange={e => setListQuantity(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-stone-400 text-xs mb-1">価格 (G)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-sm text-stone-200"
                    value={listPrice}
                    onChange={e => setListPrice(e.target.value)}
                    placeholder="例: 500"
                  />
                </div>
              </div>
              <button
                onClick={handleList}
                disabled={loading || !selectedItem || !listPrice}
                className="w-full py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-stone-700 text-white rounded font-bold"
              >
                出品する（最大10個まで）
              </button>
              <p className="text-xs text-stone-500 mt-2">※出品するにはこの村に家を所有している必要があります。</p>
            </div>
          </div>

          {/* 自分の出品一覧 */}
          <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
            <h2 className="text-blue-400 font-bold mb-3">自分の出品一覧</h2>
            <div className="space-y-2">
              {listings.filter(l => l.sellerId === myId).length === 0 && (
                <p className="text-stone-500 text-sm">現在出品しているアイテムはありません。</p>
              )}
              {listings.filter(l => l.sellerId === myId).map(l => {
                const rStyle = RARITY_STYLE[l.metadata?.rarity ?? 'NORMAL']
                const fullName = l.metadata?.rarity && l.metadata.rarity !== 'NORMAL'
                  ? `${l.metadata.prefix ?? ''}${l.itemName}${l.metadata.suffix ?? ''}`
                  : l.itemName

                return (
                  <div key={l.id} className="border border-stone-800 rounded p-3 bg-stone-950 flex justify-between items-center">
                    <div>
                      <span className={`${rStyle?.color ?? 'text-stone-200'} font-bold text-sm`}>
                        {rStyle?.label} {fullName}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-amber-400 font-bold">{l.price} G</span>
                      <button
                        onClick={() => handleCancel(l.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded"
                      >
                        取り消す
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
