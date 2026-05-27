import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Item { id: string; name: string; category: string; quantity: number; durability: number | null }

export default function InventoryPanel() {
  const [items, setItems] = useState<Item[]>([])
  useEffect(() => {
    api.get<{ success: boolean; items?: Item[] }>('/game/inventory').then(r => {
      if (r.success && r.items) setItems(r.items)
    })
  }, [])
  return (
    <div className="space-y-2">
      <h2 className="text-amber-400 font-bold">🎒 所持品 ({items.length}/50)</h2>
      {items.length === 0 && <p className="text-stone-600 text-sm text-center py-4">所持品がありません。</p>}
      {items.map(i => (
        <div key={i.id} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
          <div>
            <span className="text-stone-200 text-sm">{i.name}</span>
            <div className="flex gap-3 text-xs text-stone-500">
              <span>×{i.quantity}</span>
              {i.durability !== null && <span>耐久:{i.durability}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {i.category === 'FOOD' && (
              <button
                onClick={() => {
                  api.post<{ success: boolean; message?: string }>('/game/eat', { itemId: i.id }).then(r => {
                    if (r.success) {
                      api.get<{ success: boolean; items?: Item[] }>('/game/inventory').then(res => {
                        if (res.success && res.items) setItems(res.items)
                      })
                      // The action has been queued, so we just let the main GamePage handle state refreshes.
                      // Alert is a bit intrusive, but we can do a simple page reload or let the parent know.
                      alert('食事を開始しました。行動タブを確認してください。')
                    } else {
                      alert(r.message || 'エラーが発生しました')
                    }
                  })
                }}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded"
              >
                食べる
              </button>
            )}
            {i.category === 'CONSUMABLE' && (
              <button
                onClick={() => {
                  api.post<{ success: boolean; message?: string }>('/game/drink', { itemId: i.id }).then(r => {
                    if (r.success) {
                      api.get<{ success: boolean; items?: Item[] }>('/game/inventory').then(res => {
                        if (res.success && res.items) setItems(res.items)
                      })
                      alert('飲む行動を開始しました。行動タブを確認してください。')
                    } else {
                      alert(r.message || 'エラーが発生しました')
                    }
                  })
                }}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
              >
                飲む
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
