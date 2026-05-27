import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Spell { spellName: string; category: string; mpCost: number }

export default function MagicPanel() {
  const [spells, setSpells] = useState<Spell[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get<{ success: boolean; spells?: Spell[] }>('/game/magic/spells').then(r => {
      if (r.success && r.spells) setSpells(r.spells)
    })
  }, [])

  const handleCast = async (spellName: string) => {
    const res = await api.post<{ success: boolean; effectText?: string; message?: string }>(
      '/game/magic/cast', { spellName }
    )
    setMessage(res.effectText ?? res.message ?? '')
  }

  return (
    <div className="space-y-3">
      <h2 className="text-amber-400 font-bold">🔮 習得魔法</h2>
      {message && <div className="bg-stone-800 border border-purple-700 rounded p-3 text-purple-300 text-sm">{message}</div>}
      {spells.length === 0 && <p className="text-stone-600 text-sm text-center py-4">魔法書を入手して魔法を習得しましょう。</p>}
      {spells.map((s, i) => (
        <div key={i} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
          <div>
            <span className="text-stone-200 text-sm">{s.spellName}</span>
            <span className="text-stone-500 text-xs ml-2">MP:{s.mpCost}</span>
          </div>
          <button onClick={() => handleCast(s.spellName)} className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white text-xs rounded">
            詠唱
          </button>
        </div>
      ))}
    </div>
  )
}
