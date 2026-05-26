import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Quest {
  id: string
  title: string
  description: string
  status: string
}

export default function QuestPanel() {
  const [quests, setQuests] = useState<Quest[]>([])

  useEffect(() => {
    api.get<{ success: boolean; quests?: Quest[] }>('/game/quests').then(res => {
      if (res.success && res.quests) setQuests(res.quests)
    })
  }, [])

  return (
    <div className="space-y-3">
      <h2 className="text-amber-400 font-bold">📋 クエスト</h2>

      {quests.length === 0 && (
        <div className="bg-stone-900 border border-stone-700 rounded p-4 text-center">
          <p className="text-stone-500 text-sm">アクティブなクエストがありません。</p>
          <p className="text-stone-600 text-xs mt-1">村人に話しかけてクエストを受けましょう。</p>
        </div>
      )}

      {quests.map(q => (
        <div key={q.id} className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-stone-200 text-sm font-medium">{q.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${q.status === 'COMPLETED' ? 'bg-green-900 text-green-400' : 'bg-amber-900 text-amber-400'}`}>
              {q.status === 'COMPLETED' ? '完了' : '進行中'}
            </span>
          </div>
          <p className="text-stone-400 text-xs leading-relaxed">{q.description}</p>
        </div>
      ))}
    </div>
  )
}
