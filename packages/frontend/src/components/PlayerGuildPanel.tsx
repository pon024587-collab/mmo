import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

interface PlayerGuild {
  id: string
  name: string
  memberCount: number
}

export default function PlayerGuildPanel() {
  const [guilds, setGuilds] = useState<PlayerGuild[]>([])
  const [newGuildName, setNewGuildName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    api.get<{ success: boolean; guilds?: PlayerGuild[] }>('/game/guild/player-guilds').then(r => {
      if (r.success && r.guilds) setGuilds(r.guilds)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!newGuildName.trim()) {
      setMessage('ギルド名を入力してください。')
      return
    }
    setLoading(true)
    setMessage('')
    const res = await api.post<{ success: boolean; message?: string }>('/game/guild/create', { name: newGuildName })
    setMessage(res.message ?? '')
    if (res.success) {
      setNewGuildName('')
      load()
    }
    setLoading(false)
  }

  const handleJoin = async (guildId: string) => {
    if (!window.confirm('このギルドに加入しますか？（※現在、他のギルドを脱退する機能はありません）')) return
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/guild/join', { guildId })
    setMessage(res.message ?? '')
    if (res.success) load()
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3">
        <h2 className="text-amber-400 font-bold text-lg">🛡️ プレイヤーギルド設立</h2>
        <p className="text-stone-400 text-xs">
          10,000Gを消費して、自分だけのギルドを設立できます。ギルドメンバーと協力してレイドボスに挑みましょう！
        </p>
        
        {message && (
          <div className={`p-3 rounded text-sm ${message.includes('成功') || message.includes('設立') || message.includes('加入') ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
            {message}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newGuildName}
            onChange={e => setNewGuildName(e.target.value)}
            placeholder="ギルド名 (最大20文字)"
            maxLength={20}
            className="flex-1 bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newGuildName}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded text-sm whitespace-nowrap"
          >
            設立する (1万G)
          </button>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3">
        <h2 className="text-amber-400 font-bold">📜 設立済みギルド一覧</h2>
        {guilds.length === 0 ? (
          <p className="text-stone-500 text-sm text-center py-4">まだプレイヤーギルドはありません。</p>
        ) : (
          <div className="space-y-2">
            {guilds.map(g => (
              <div key={g.id} className="flex items-center justify-between bg-stone-800 rounded p-3">
                <div>
                  <span className="text-stone-200 font-bold">{g.name}</span>
                  <span className="text-stone-500 text-xs ml-2">メンバー: {g.memberCount}人</span>
                </div>
                <button
                  onClick={() => handleJoin(g.id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-blue-100 text-xs font-bold rounded transition-colors"
                >
                  加入する
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
