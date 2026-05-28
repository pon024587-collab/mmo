import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

interface PlayerGuild {
  id: string
  name: string
  memberCount: number
  requiresApproval: boolean
  isMember: boolean
  hasApplied: boolean
}

interface GuildMember {
  id: string
  name: string
  role: string
  joinedAt: string
}

interface GuildApplication {
  id: string
  characterId: string
  characterName: string
  message: string
  appliedAt: string
}

interface MyGuildDetails {
  id: string
  name: string
  ownerCharacterId: string
  requiresApproval: boolean
  members: GuildMember[]
  applications: GuildApplication[]
}

export default function PlayerGuildPanel() {
  const [guilds, setGuilds] = useState<PlayerGuild[]>([])
  const [myGuild, setMyGuild] = useState<MyGuildDetails | null>(null)
  
  const [newGuildName, setNewGuildName] = useState('')
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null)
  
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    api.get<{ success: boolean; guild?: MyGuildDetails }>('/game/guild/my-guild').then(r => {
      if (r.success && r.guild) {
        setMyGuild(r.guild)
      } else {
        setMyGuild(null)
        api.get<{ success: boolean; guilds?: PlayerGuild[] }>('/game/guild/player-guilds').then(r2 => {
          if (r2.success && r2.guilds) setGuilds(r2.guilds)
        })
      }
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
    const res = await api.post<{ success: boolean; message?: string }>('/game/guild/create', { name: newGuildName, requiresApproval })
    setMessage(res.message ?? '')
    if (res.success) {
      setNewGuildName('')
      load()
    }
    setLoading(false)
  }

  const handleApply = async (guildId: string, isApproval: boolean) => {
    if (!isApproval && !window.confirm('このギルドに加入しますか？')) return
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/guild/apply', { guildId, message: applyMessage })
    setMessage(res.message ?? '')
    if (res.success) {
      setApplyMessage('')
      setSelectedGuildId(null)
      load()
    }
    setLoading(false)
  }

  const handleManageApp = async (appId: string, approve: boolean) => {
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/guild/manage-application', { applicationId: appId, approve })
    setMessage(res.message ?? '')
    if (res.success) load()
    setLoading(false)
  }

  const handleKick = async (characterId: string) => {
    if (!myGuild) return
    if (!window.confirm('本当にこのメンバーを追放しますか？')) return
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/guild/kick', { guildId: myGuild.id, characterId })
    setMessage(res.message ?? '')
    if (res.success) load()
    setLoading(false)
  }

  const handleLeave = async () => {
    if (!myGuild) return
    if (!window.confirm('本当にギルドを脱退しますか？')) return
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/guild/leave', { guildId: myGuild.id })
    setMessage(res.message ?? '')
    if (res.success) load()
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('エラー') || message.includes('できません') || message.includes('無効') ? 'bg-red-900/60 text-red-300' : 'bg-green-900/60 text-green-300'}`}>
          {message}
        </div>
      )}

      {myGuild ? (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-amber-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-amber-400 font-bold text-xl mb-1">{myGuild.name}</h2>
                <span className="text-stone-400 text-xs">
                  {myGuild.requiresApproval ? '🔒 承認制' : '🔓 自由参加'} / メンバー: {myGuild.members.length}人
                </span>
              </div>
              <button
                onClick={handleLeave}
                disabled={loading}
                className="px-3 py-1.5 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-100 text-xs rounded transition-colors"
              >
                脱退する
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-stone-300 font-medium text-sm border-b border-stone-700 pb-1">メンバー一覧</h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {myGuild.members.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-stone-800 rounded p-2">
                    <div>
                      <span className={`text-sm ${m.role === 'MASTER' ? 'text-amber-400 font-bold' : 'text-stone-200'}`}>
                        {m.role === 'MASTER' ? '👑 ' : ''}{m.name}
                      </span>
                    </div>
                    {myGuild.applications && m.role !== 'MASTER' && (
                      <button
                        onClick={() => handleKick(m.id)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-stone-900 rounded"
                      >
                        追放
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {myGuild.applications && myGuild.applications.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-amber-400 font-medium text-sm border-b border-amber-900/50 pb-1">📥 加入申請</h3>
                <div className="space-y-2">
                  {myGuild.applications.map(app => (
                    <div key={app.id} className="bg-stone-800 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-200 font-bold">{app.characterName}</span>
                        <span className="text-stone-500 text-xs">{new Date(app.appliedAt).toLocaleString()}</span>
                      </div>
                      {app.message && <div className="text-stone-400 text-xs mb-3 italic">「{app.message}」</div>}
                      <div className="flex gap-2">
                        <button onClick={() => handleManageApp(app.id, true)} disabled={loading} className="flex-1 py-1.5 bg-green-800 hover:bg-green-700 text-green-100 text-xs font-bold rounded">承認</button>
                        <button onClick={() => handleManageApp(app.id, false)} disabled={loading} className="flex-1 py-1.5 bg-red-900 hover:bg-red-800 text-red-100 text-xs font-bold rounded">拒否</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3">
            <h2 className="text-amber-400 font-bold text-lg">🛡️ プレイヤーギルド設立</h2>
            <p className="text-stone-400 text-xs">
              10,000Gを消費して、自分だけのギルドを設立できます。
            </p>
            
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newGuildName}
                onChange={e => setNewGuildName(e.target.value)}
                placeholder="ギルド名 (最大20文字)"
                maxLength={20}
                className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm"
              />
              <label className="flex items-center gap-2 text-stone-300 text-sm cursor-pointer">
                <input type="checkbox" checked={requiresApproval} onChange={e => setRequiresApproval(e.target.checked)} className="rounded bg-stone-800 border-stone-600" />
                加入を申請制にする（マスターの承認が必要）
              </label>
              <button
                onClick={handleCreate}
                disabled={loading || !newGuildName}
                className="w-full py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded text-sm"
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
                  <div key={g.id} className="bg-stone-800 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-stone-200 font-bold">{g.name}</span>
                        <span className="text-stone-500 text-xs ml-2">メンバー: {g.memberCount}人</span>
                        {g.requiresApproval && <span className="ml-2 text-xs bg-stone-700 text-stone-300 px-1.5 py-0.5 rounded">申請制</span>}
                      </div>
                      
                      {g.hasApplied ? (
                        <span className="text-amber-500 text-xs font-bold px-2 py-1">申請中</span>
                      ) : (
                        <button
                          onClick={() => selectedGuildId === g.id ? setSelectedGuildId(null) : setSelectedGuildId(g.id)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-blue-100 text-xs font-bold rounded transition-colors"
                        >
                          {g.requiresApproval ? '申請する' : '加入する'}
                        </button>
                      )}
                    </div>
                    
                    {selectedGuildId === g.id && (
                      <div className="mt-3 pt-3 border-t border-stone-700 flex flex-col gap-2">
                        {g.requiresApproval && (
                          <input
                            type="text"
                            value={applyMessage}
                            onChange={e => setApplyMessage(e.target.value)}
                            placeholder="マスターへのメッセージ（任意）"
                            maxLength={50}
                            className="w-full bg-stone-900 border border-stone-600 rounded px-2 py-1.5 text-stone-200 text-sm"
                          />
                        )}
                        <button
                          onClick={() => handleApply(g.id, g.requiresApproval)}
                          disabled={loading}
                          className="w-full py-1.5 bg-green-800 hover:bg-green-700 text-white text-sm font-bold rounded"
                        >
                          {g.requiresApproval ? '加入申請を送る' : '今すぐ加入する'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
