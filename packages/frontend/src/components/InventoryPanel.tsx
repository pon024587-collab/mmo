import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  durability: number | null
}

interface Equipment {
  equippedWeaponId: string | null
  equippedArmorId: string | null
  equippedAccessoryId: string | null
}

export default function InventoryPanel() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [equipment, setEquipment] = useState<Equipment>({
    equippedWeaponId: null,
    equippedArmorId: null,
    equippedAccessoryId: null,
  })
  const [message, setMessage] = useState('')

  const fetchInventory = async () => {
    const res = await api.get<{ success: boolean; items?: InventoryItem[] }>('/game/inventory')
    if (res.success && res.items) setItems(res.items)
  }

  const fetchEquipment = async () => {
    const res = await api.get<{ success: boolean; equipment?: Equipment }>('/game/equipment')
    if (res.success && res.equipment) setEquipment(res.equipment)
  }

  useEffect(() => {
    fetchInventory()
    fetchEquipment()
  }, [])

  const handleEquip = async (itemId: string) => {
    const res = await api.post<{ success: boolean; message?: string }>('/game/equip', { itemId })
    setMessage(res.message ?? '')
    if (res.success) {
      fetchEquipment()
      fetchInventory()
    }
  }

  const handleUnequip = async (slot: 'WEAPON' | 'ARMOR' | 'ACCESSORY') => {
    const res = await api.post<{ success: boolean; message?: string }>('/game/unequip', { slot })
    setMessage(res.message ?? '')
    if (res.success) {
      fetchEquipment()
      fetchInventory()
    }
  }

  const handleUse = async (item: InventoryItem) => {
    if (item.category === 'FOOD' || item.category === 'WATER') {
      const endpoint = item.category === 'WATER' ? '/game/drink' : '/game/eat'
      const res = await api.post<{ success: boolean; message?: string }>(endpoint, { itemId: item.id })
      setMessage(res.message ?? (res.success ? '使用しました。' : '使用できませんでした。'))
      if (res.success) fetchInventory()
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('失敗') || message.includes('できません') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* 装備 */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold mb-3">現在の装備</h2>
        <div className="space-y-2 text-sm">
          <EquipSlot 
            label="武器" 
            item={items.find(i => i.id === equipment.equippedWeaponId)} 
            onUnequip={() => handleUnequip('WEAPON')} 
          />
          <EquipSlot 
            label="防具" 
            item={items.find(i => i.id === equipment.equippedArmorId)} 
            onUnequip={() => handleUnequip('ARMOR')} 
          />
          <EquipSlot 
            label="装飾" 
            item={items.find(i => i.id === equipment.equippedAccessoryId)} 
            onUnequip={() => handleUnequip('ACCESSORY')} 
          />
        </div>
      </div>

      {/* 所持品一覧 */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold mb-3">所持品</h2>
        {items.length === 0 && <p className="text-stone-600 text-sm">アイテムを持っていません。</p>}
        <div className="space-y-2">
          {items.map(item => {
            const isEquipped = item.id === equipment.equippedWeaponId || item.id === equipment.equippedArmorId || item.id === equipment.equippedAccessoryId
            return (
              <div key={item.id} className={`border ${isEquipped ? 'border-amber-700' : 'border-stone-800'} rounded p-2 flex justify-between items-center bg-stone-950`}>
                <div>
                  <span className={isEquipped ? 'text-amber-400 text-sm' : 'text-stone-200 text-sm'}>{item.name}</span>
                  <span className="text-stone-500 text-xs ml-2">×{item.quantity}</span>
                  <span className="text-stone-600 text-xs ml-2">[{item.category}]</span>
                  {isEquipped && <span className="text-amber-600 text-xs ml-2">(装備中)</span>}
                </div>
                <div className="flex gap-2">
                  {!isEquipped && (item.category === 'WEAPON' || item.category === 'ARMOR') && (
                    <button 
                      onClick={() => handleEquip(item.id)}
                      className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded"
                    >
                      装備
                    </button>
                  )}
                  {item.category === 'FOOD' && (
                    <button 
                      onClick={() => handleUse(item)}
                      className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded"
                    >
                      食べる
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EquipSlot({ label, item, onUnequip }: { label: string; item?: InventoryItem; onUnequip: () => void }) {
  return (
    <div className="flex justify-between items-center p-2 border border-stone-800 rounded bg-stone-950">
      <div>
        <span className="text-stone-500 w-12 inline-block">{label}</span>
        <span className={item ? 'text-stone-200' : 'text-stone-600'}>
          {item ? item.name : '（なし）'}
        </span>
      </div>
      {item && (
        <button onClick={onUnequip} className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs rounded">
          外す
        </button>
      )}
    </div>
  )
}
