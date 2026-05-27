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
        <div key={i.id} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between">
          <span className="text-stone-200 text-sm">{i.name}</span>
          <div className="flex gap-3 text-xs text-stone-500">
            <span>×{i.quantity}</span>
            {i.durability !== null && <span>耐久:{i.durability}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
