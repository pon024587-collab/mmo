import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface MarketItem {
  itemTemplateId: string
  name: string
  currentPrice: number
  basePrice: number
  stockQuantity: number
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  durability: number | null
}

export default function MarketPanel() {
  const [listings, setListings] = useState<MarketItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get<{ success: boolean; listings?: MarketItem[] }>('/game/market').then(r => {
      if (r.success && r.listings) setListings(r.listings)
    })
    api.get<{ success: boolean; items?: InventoryItem[] }>('/game/inventory').then(r => {
      if (r.success && r.items) setInventory(r.items)
    })
  }, [])

  const handleBuy = async (itemTemplateId: string, name: string, price: number) => {
    const res = await api.post<{ success: boolean; message?: string }>(
      '/game/market/buy', { itemTemplateId }
    )
    setMessage(res.success ? `${name}を${price}Gで購入しました。` : (res.message ?? '購入失敗'))
  }

  const handleSell = async (itemId: string, name: string) => {
    const res = await api.post<{ success: boolean; goldEarned?: number; message?: string }>(
      '/game/market/sell', { itemId }
    )
    setMessage(res.success ? `${name}を${res.goldEarned}Gで売却しました。` : (res.message ?? '売却失敗'))
    if (res.success) setInventory(prev => prev.filter(i => i.id !== itemId))
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('失敗') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setTab('buy')} className={`flex-1 py-2 rounded text-sm ${tab === 'buy' ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>購入</button>
        <button onClick={() => setTab('sell')} className={`flex-1 py-2 rounded text-sm ${tab === 'sell' ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>売却</button>
      </div>

      {tab === 'buy' && (
        <div className="space-y-2">
          {listings.length === 0 && <p className="text-stone-600 text-sm text-center py-4">取引可能なアイテムがありません。</p>}
          {listings.map(item => (
            <div key={item.itemTemplateId} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
              <div>
                <span className="text-stone-200 text-sm">{item.name}</span>
                <span className="text-stone-500 text-xs ml-2">在庫: {item.stockQuantity}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-300 text-sm">{item.currentPrice}G</span>
                <button
                  onClick={() => handleBuy(item.itemTemplateId, item.name, item.currentPrice)}
                  disabled={item.stockQuantity === 0}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs rounded"
                >
                  購入
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sell' && (
        <div className="space-y-2">
          {inventory.length === 0 && <p className="text-stone-600 text-sm text-center py-4">売れるアイテムがありません。</p>}
          {inventory.map(item => (
            <div key={item.id} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
              <div>
                <span className="text-stone-200 text-sm">{item.name}</span>
                <span className="text-stone-500 text-xs ml-2">×{item.quantity}</span>
                {item.durability !== null && <span className="text-stone-600 text-xs ml-1">耐久:{item.durability}</span>}
              </div>
              <button
                onClick={() => handleSell(item.id, item.name)}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs rounded"
              >
                売却
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
