import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface ItemMetadata {
  rarity?: 'NORMAL' | 'MAGIC' | 'RARE' | 'EPIC' | 'LEGENDARY'
  prefix?: string
  suffix?: string
  bonusStrength?: number
  bonusDexterity?: number
  slots?: number
  crystals?: Record<string, number>[]
  bonus?: Record<string, number>
  enhance?: number
}

interface ItemProperties {
  attack?: number
  defense?: number
  elementalAttack?: string
  elementalAttackValue?: number
  elementalResistance?: string
  elementalResistanceValue?: number
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  durability: number | null
  metadata: ItemMetadata
  properties: ItemProperties
}

interface Equipment {
  equippedWeaponId: string | null
  equippedArmorId: string | null
  equippedAccessoryId: string | null
}

const RARITY_STYLE: Record<string, { color: string; label: string; border: string }> = {
  NORMAL:    { color: 'text-stone-200',  label: '',          border: 'border-stone-800' },
  MAGIC:     { color: 'text-blue-400',   label: '✦ 魔法',   border: 'border-blue-800'  },
  RARE:      { color: 'text-yellow-300', label: '★ レア',   border: 'border-yellow-700'},
  EPIC:      { color: 'text-purple-400', label: '◆ エピック',border: 'border-purple-700'},
  LEGENDARY: { color: 'text-orange-400', label: '🔥 伝説',  border: 'border-orange-600'},
}

function getDisplayName(item: InventoryItem): string {
  const m = item.metadata
  let baseName = item.name
  if (m?.rarity && m.rarity !== 'NORMAL') {
    baseName = `${m.prefix ?? ''}${item.name}${m.suffix ?? ''}`
  }
  if (m?.enhance && m.enhance > 0) {
    baseName = `${baseName} (+${m.enhance})`
  }
  return baseName
}

function getRarityStyle(rarity?: string) {
  return RARITY_STYLE[rarity ?? 'NORMAL'] ?? RARITY_STYLE.NORMAL
}

export default function InventoryPanel() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [equipment, setEquipment] = useState<Equipment>({
    equippedWeaponId: null,
    equippedArmorId: null,
    equippedAccessoryId: null,
  })
  const [message, setMessage] = useState('')
  const [socketTarget, setSocketTarget] = useState<string | null>(null)
  const [selectedCrystal, setSelectedCrystal] = useState<string>('')

  // 持っているクリスタル一覧を取得
  const crystalItems = items.filter(i => i.name === 'CRYSTAL' || i.name === 'クリスタル')

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
    if (res.success) { fetchEquipment(); fetchInventory() }
  }

  const handleUnequip = async (slot: 'WEAPON' | 'ARMOR' | 'ACCESSORY') => {
    const res = await api.post<{ success: boolean; message?: string }>('/game/unequip', { slot })
    setMessage(res.message ?? '')
    if (res.success) { fetchEquipment(); fetchInventory() }
  }

  const handleUse = async (item: InventoryItem) => {
    if (item.category === 'FOOD' || item.category === 'WATER' || item.category === 'CONSUMABLE') {
      const isDrink = ['水', 'WATER', '薬草茶'].includes(item.name)
      const endpoint = isDrink ? '/game/drink' : '/game/eat'
      const res = await api.post<{ success: boolean; message?: string }>(endpoint, { itemId: item.id })
      setMessage(res.message ?? (res.success ? '使用しました。' : '使用できませんでした。'))
      if (res.success) fetchInventory()
    }
  }

  const handleSocket = async (equipmentId: string) => {
    if (!selectedCrystal) return setMessage('クリスタルを選択してください。')
    const res = await api.post<{ success: boolean; message?: string }>('/game/equipment/socket', { equipmentItemId: equipmentId, crystalItemId: selectedCrystal })
    setMessage(res.message ?? '')
    setSocketTarget(null)
    setSelectedCrystal('')
    if (res.success) { fetchEquipment(); fetchInventory() }
  }

  const handleEnhance = async (equipmentId: string) => {
    const res = await api.post<{ success: boolean; message?: string; result?: string }>('/game/equipment/enhance', { itemId: equipmentId })
    setMessage(res.message ?? '')
    if (res.success || res.result === 'DESTROY') {
      fetchEquipment()
      fetchInventory()
    }
  }


  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('失敗') || message.includes('できません') || message.includes('必要') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* 装備スロット */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold mb-3">⚔️ 現在の装備</h2>
        <div className="space-y-2 text-sm">
          <EquipSlot label="武器" item={items.find(i => i.id === equipment.equippedWeaponId)} onUnequip={() => handleUnequip('WEAPON')} />
          <EquipSlot label="防具" item={items.find(i => i.id === equipment.equippedArmorId)} onUnequip={() => handleUnequip('ARMOR')} />
          <EquipSlot label="装飾" item={items.find(i => i.id === equipment.equippedAccessoryId)} onUnequip={() => handleUnequip('ACCESSORY')} />
        </div>
      </div>

      {/* 所持品一覧 */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold mb-3">🎒 所持品 <span className="text-stone-500 font-normal text-xs">({items.length}/50)</span></h2>
        {items.length === 0 && <p className="text-stone-600 text-sm">アイテムを持っていません。</p>}
        <div className="space-y-2">
          {items.map(item => {
            const isEquipped = item.id === equipment.equippedWeaponId || item.id === equipment.equippedArmorId || item.id === equipment.equippedAccessoryId
            const rStyle = getRarityStyle(item.metadata?.rarity)
            const displayName = getDisplayName(item)
            const meta = item.metadata
            const hasBonus = (meta?.bonusStrength ?? 0) > 0 || (meta?.bonusDexterity ?? 0) > 0

            return (
              <div
                key={item.id}
                className={`border ${isEquipped ? 'border-amber-700 bg-amber-950/30' : rStyle.border + ' bg-stone-950'} rounded p-2`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    {/* レアリティラベル */}
                    {meta?.rarity && meta.rarity !== 'NORMAL' && (
                      <span className={`${rStyle.color} text-xs font-bold mr-1`}>{rStyle.label}</span>
                    )}
                    <span className={`${rStyle.color} text-sm font-medium`}>{displayName}</span>
                    <span className="text-stone-500 text-xs ml-2">×{item.quantity}</span>
                    {isEquipped && <span className="text-amber-500 text-xs ml-2">（装備中）</span>}
                  </div>
                  <div className="flex gap-2">
                    {!isEquipped && (item.category === 'WEAPON' || item.category === 'ARMOR') && (
                      <>
                        <button
                          onClick={() => handleEnhance(item.id)}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded"
                        >
                          強化
                        </button>
                        <button
                          onClick={() => handleEquip(item.id)}
                          className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded"
                        >
                          装備
                        </button>
                      </>
                    )}
                    {(item.category === 'FOOD' || item.category === 'CONSUMABLE') && (
                      <button
                        onClick={() => handleUse(item)}
                        className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded"
                      >
                        {['水', 'WATER', '薬草茶'].includes(item.name) ? '飲む' : '食べる'}
                      </button>
                    )}
                  </div>
                </div>
                {/* 基礎ステータス（properties）表示 */}
                {(item.category === 'WEAPON' || item.category === 'ARMOR' || item.category === 'ACCESSORY') && (
                  <div className="mt-1 flex flex-wrap gap-2 text-xs pl-1">
                    {(item.properties?.attack ?? 0) > 0 && (
                      <span className="text-orange-400">⚔️ ATK {item.properties.attack}</span>
                    )}
                    {(item.properties?.defense ?? 0) > 0 && (
                      <span className="text-sky-400">🛡️ DEF {item.properties.defense}</span>
                    )}
                    {item.properties?.elementalAttack && (item.properties.elementalAttackValue ?? 0) > 0 && (
                      <span className="text-yellow-400">✨ {item.properties.elementalAttack} +{item.properties.elementalAttackValue}</span>
                    )}
                    {item.properties?.elementalResistance && (item.properties.elementalResistanceValue ?? 0) > 0 && (
                      <span className="text-teal-400">🔰 {item.properties.elementalResistance} 耐性 +{item.properties.elementalResistanceValue}</span>
                    )}
                    {meta?.slots && (
                      <span className="text-purple-300">◆ スロット {(meta.crystals || []).length}/{meta.slots}</span>
                    )}
                  </div>
                )}
                {/* クラフト付与ボーナス */}
                {(hasBonus) && (
                  <div className="mt-1 flex gap-3 text-xs text-stone-400 pl-1 items-center">
                    {(meta?.bonusStrength ?? 0) > 0 && <span className="text-red-400">筋力 +{meta?.bonusStrength}</span>}
                    {(meta?.bonusDexterity ?? 0) > 0 && <span className="text-green-400">器用さ +{meta?.bonusDexterity}</span>}
                  </div>
                )}
                {/* クリスタル一覧 */}
                {meta?.slots && (meta.crystals || []).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 pl-1">
                    {(meta.crystals || []).map((c, idx) => (
                      <span key={idx} className="text-purple-400 bg-purple-900/30 px-1 rounded text-xs">
                        {Object.entries(c).map(([k, v]) => `${k}+${v}`).join(' ')}
                      </span>
                    ))}
                  </div>
                )}
                {/* クリスタル装着UI */}
                {meta?.slots && (meta.crystals || []).length < meta.slots && !isEquipped && (
                  <div className="mt-2 text-right">
                    {socketTarget === item.id ? (
                      <div className="flex justify-end gap-1">
                        <select
                          className="bg-stone-900 border border-stone-600 text-xs px-1"
                          value={selectedCrystal}
                          onChange={e => setSelectedCrystal(e.target.value)}
                        >
                          <option value="">-- クリスタルを選択 --</option>
                          {crystalItems.map(c => {
                            const b = c.metadata?.bonus || {}
                            return <option key={c.id} value={c.id}>{c.name} ({Object.entries(b).map(([k,v]) => `${k}+${v}`).join(' ')})</option>
                          })}
                        </select>
                        <button onClick={() => handleSocket(item.id)} className="px-2 py-1 bg-purple-700 hover:bg-purple-600 text-white text-xs rounded">はめる</button>
                        <button onClick={() => setSocketTarget(null)} className="px-2 py-1 bg-stone-700 hover:bg-stone-600 text-white text-xs rounded">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setSocketTarget(item.id)} className="text-xs text-purple-400 underline hover:text-purple-300">
                        + クリスタルを装着
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EquipSlot({ label, item, onUnequip }: { label: string; item?: InventoryItem; onUnequip: () => void }) {
  const rStyle = item ? getRarityStyle(item.metadata?.rarity) : RARITY_STYLE.NORMAL
  return (
    <div className={`flex justify-between items-center p-2 border ${item ? rStyle.border : 'border-stone-800'} rounded bg-stone-950`}>
      <div>
        <span className="text-stone-500 w-10 inline-block text-xs">{label}</span>
        <span className={item ? rStyle.color : 'text-stone-600'}>
          {item ? getDisplayName(item) : '（なし）'}
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
