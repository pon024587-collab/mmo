import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface GuildQuest {
  id: string
  title: string
  description: string
  itemName: string
  requiredQuantity: number
  rewardGold: number
  isCompleted: boolean
}

interface Guild {
  guildId: string
  guildName: string
  guildType: string
  quests: GuildQuest[]
}

const GUILD_TYPE_EMOJI: Record<string, string> = {
  ADVENTURER: '⚔️',
  MERCHANT: '💰',
  FARMER: '🌾',
  MAGE: '🔮',
}

export default function GuildQuestPanel() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [noGuild, setNoGuild] = useState(false)

  const fetchQuests = () => {
    api.get<{ success: boolean; guilds?: Guild[]; message?: string }>('/game/guild/quests').then(res => {
      if (res.success) {
        if (!res.guilds || res.guilds.length === 0) {
          setNoGuild(true)
        } else {
          setGuilds(res.guilds)
        }
      }
    })
  }

  useEffect(() => { fetchQuests() }, [])

  const handleComplete = async (questId: string, itemName: string, qty: number) => {
    setLoading(true)
    setMessage('')
    const res = await api.post<{ success: boolean; message?: string; rewardGold?: number }>(
      '/game/guild/complete', { questId }
    )
    setMessage(res.message ?? '')
    if (res.success) fetchQuests()
    setLoading(false)
  }

  if (noGuild) {
    return (
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 text-center">
        <p className="text-stone-400 text-sm">この村にギルドはありません。</p>
        <p className="text-stone-600 text-xs mt-2">発展度の高い都市に移動するとギルドがあります。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-amber-400 font-bold">🏛️ ギルド日替わりクエスト</h2>
        <span className="text-stone-500 text-xs">毎日0時にリセット</span>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('足りません') || message.includes('失敗') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {guilds.map(guild => (
        <div key={guild.guildId} className="bg-stone-900 border border-stone-700 rounded-lg overflow-hidden">
          <div className="bg-stone-800 px-4 py-2 flex items-center gap-2">
            <span>{GUILD_TYPE_EMOJI[guild.guildType] ?? '🏛️'}</span>
            <span className="text-stone-200 font-medium text-sm">{guild.guildName}</span>
            <span className="text-stone-500 text-xs ml-auto">
              {guild.quests.filter(q => q.isCompleted).length}/{guild.quests.length} 完了
            </span>
          </div>

          <div className="divide-y divide-stone-800">
            {guild.quests.map(quest => (
              <div key={quest.id} className={`p-3 flex items-center gap-3 ${quest.isCompleted ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {quest.isCompleted && <span className="text-green-400 text-xs">✓</span>}
                    <span className={`text-sm font-medium ${quest.isCompleted ? 'text-stone-500 line-through' : 'text-stone-200'}`}>
                      {quest.title}
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs truncate">{quest.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-stone-400 text-xs">
                      {quest.itemName} × {quest.requiredQuantity}
                    </span>
                    <span className="text-amber-400 text-xs">+{quest.rewardGold}G</span>
                  </div>
                </div>

                {!quest.isCompleted && (
                  <button
                    onClick={() => handleComplete(quest.id, quest.itemName, quest.requiredQuantity)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs rounded whitespace-nowrap"
                  >
                    納品する
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
