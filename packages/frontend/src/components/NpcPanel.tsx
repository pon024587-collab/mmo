import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Npc {
  id: string
  name: string
  role: string
}

interface TalkResult {
  text: string
  questAvailable: boolean
}

const ROLE_LABELS: Record<string, string> = {
  FARMER: '農民', MERCHANT: '商人', BLACKSMITH: '鍛冶屋',
  KNIGHT: '騎士', MAGE: '魔法使い', DOCTOR: '医師',
  PRIEST: '神父', MONEYLENDER: '金貸し', ELDER: '長老',
}

export default function NpcPanel() {
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [dialogue, setDialogue] = useState<{ npcName: string; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<{ success: boolean; npcs?: Npc[] }>('/game/npc/list').then(res => {
      if (res.success && res.npcs) setNpcs(res.npcs)
    })
  }, [])

  const handleTalk = async (npc: Npc) => {
    setLoading(true)
    const res = await api.post<TalkResult>('/game/npc/talk', { npcId: npc.id })
    setDialogue({ npcName: npc.name, text: res.text })
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      {dialogue && (
        <div className="bg-stone-800 border border-amber-800 rounded-lg p-4">
          <p className="text-amber-400 text-sm font-medium mb-2">{dialogue.npcName}</p>
          <p className="text-stone-300 text-sm leading-relaxed">{dialogue.text}</p>
          <button onClick={() => setDialogue(null)} className="mt-3 text-stone-500 text-xs hover:text-stone-300">閉じる</button>
        </div>
      )}

      <div className="space-y-2">
        {npcs.length === 0 && <p className="text-stone-600 text-sm text-center py-4">この村に村人がいません。</p>}
        {npcs.map(npc => (
          <div key={npc.id} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
            <div>
              <span className="text-stone-200 text-sm">{npc.name}</span>
              <span className="text-stone-500 text-xs ml-2">{ROLE_LABELS[npc.role] ?? npc.role}</span>
            </div>
            <button
              onClick={() => handleTalk(npc)}
              disabled={loading}
              className="px-3 py-1 bg-stone-700 hover:bg-stone-600 disabled:opacity-40 text-stone-300 text-xs rounded"
            >
              話す
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
