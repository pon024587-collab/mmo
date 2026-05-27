import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Npc {
  id: string
  name: string
  role: string
}

interface Quest {
  id: string
  title: string
  description: string
  rewardGold: number
}

const ROLE_LABELS: Record<string, string> = {
  FARMER: '農民', MERCHANT: '商人', BLACKSMITH: '鍛冶屋',
  KNIGHT: '騎士', MAGE: '魔法使い', DOCTOR: '医師',
  PRIEST: '神父', MONEYLENDER: '金貸し', ELDER: '長老',
}

export default function NpcPanel() {
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [dialogue, setDialogue] = useState<{ npcId: string; npcName: string; text: string; questAvailable: boolean } | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get<{ success: boolean; npcs?: Npc[] }>('/game/npc/list').then(res => {
      if (res.success && res.npcs) setNpcs(res.npcs)
    })
  }, [])

  const handleTalk = async (npc: Npc) => {
    setLoading(true)
    setMessage('')
    const res = await api.post<{ text: string; questAvailable: boolean }>('/game/npc/talk', { npcId: npc.id })
    setDialogue({ npcId: npc.id, npcName: npc.name, text: res.text, questAvailable: res.questAvailable })

    // クエストが利用可能なら取得
    if (res.questAvailable) {
      const qRes = await api.get<{ success: boolean; quests?: Quest[] }>(`/game/npc/quests?npcId=${npc.id}`)
      if (qRes.success && qRes.quests) setQuests(qRes.quests)
    }
    setLoading(false)
  }

  const handleAcceptQuest = async (quest: Quest) => {
    if (!dialogue) return
    const res = await api.post<{ success: boolean; questId?: string; message?: string }>(
      '/game/quests/accept',
      { npcId: dialogue.npcId, title: quest.title, description: quest.description, rewardGold: quest.rewardGold }
    )
    if (res.success) {
      setMessage(`クエスト「${quest.title}」を受諾しました。`)
      setQuests([])
    } else {
      setMessage(res.message ?? 'クエストを受諾できませんでした。')
    }
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className="bg-green-900 text-green-300 rounded p-3 text-sm">{message}</div>
      )}

      {/* 会話ダイアログ */}
      {dialogue && (
        <div className="bg-stone-800 border border-amber-800 rounded-lg p-4">
          <p className="text-amber-400 text-sm font-medium mb-2">{dialogue.npcName}</p>
          <p className="text-stone-300 text-sm leading-relaxed mb-3">{dialogue.text}</p>

          {/* クエスト一覧 */}
          {quests.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-stone-400 text-xs">📋 依頼があります：</p>
              {quests.map(q => (
                <div key={q.id} className="bg-stone-900 border border-stone-600 rounded p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-stone-200 text-sm font-medium">{q.title}</span>
                    <span className="text-amber-400 text-xs">報酬: {q.rewardGold}G</span>
                  </div>
                  <p className="text-stone-400 text-xs mb-2">{q.description}</p>
                  <button
                    onClick={() => handleAcceptQuest(q)}
                    className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded"
                  >
                    受諾する
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => { setDialogue(null); setQuests([]) }}
            className="text-stone-500 text-xs hover:text-stone-300">閉じる</button>
        </div>
      )}

      {/* NPC一覧 */}
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
