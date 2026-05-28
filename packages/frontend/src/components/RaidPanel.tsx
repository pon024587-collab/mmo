import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

interface RaidBoss {
  id: string
  name: string
  element: string
  maxHp: number
  currentHp: number
  physDef: number
  magDef: number
  endsAt: string
}

interface GuildRank {
  guildId: string
  guildName: string
  totalDamage: number
}

interface GuildContrib {
  characterName: string
  raidDamageTotal: number
  raidGachaTickets: number
}

const ELEMENT_LABELS: Record<string, string> = {
  FIRE: '🔥炎', WATER: '💧水', WIND: '🌪風', EARTH: '🌿土',
  THUNDER: '⚡雷', ICE: '❄氷', LIGHT: '✨光', DARK: '🌑闇', POISON: '☠毒'
}

const MILESTONES = [100, 1000, 10000, 100000, 300000, 500000, 1000000]

export default function RaidPanel() {
  const [boss, setBoss] = useState<RaidBoss | null>(null)
  const [ranking, setRanking] = useState<GuildRank[]>([])
  const [contribs, setContribs] = useState<GuildContrib[]>([])
  const [tickets, setTickets] = useState(0)
  const [tab, setTab] = useState<'boss' | 'ranking' | 'guild' | 'gacha'>('boss')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [gachaResult, setGachaResult] = useState('')

  const load = useCallback(() => {
    api.get<{ success: boolean; boss?: RaidBoss }>('/game/raid').then(r => {
      setBoss(r.boss ?? null)
    })
    api.get<{ success: boolean; ranking?: GuildRank[] }>('/game/raid/ranking').then(r => {
      if (r.ranking) setRanking(r.ranking)
    })
    api.get<{ success: boolean; contributions?: GuildContrib[] }>('/game/guild/contributions').then(r => {
      if (r.contributions) setContribs(r.contributions)
    })
    api.get<{ success: boolean; tickets?: number }>('/game/raid/gacha/tickets').then(r => {
      setTickets(r.tickets ?? 0)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const handleAttack = async () => {
    if (!boss) return
    setLoading(true)
    setMessage('')
    const res = await api.post<{ success: boolean; message?: string; damage?: number }>('/game/raid/attack', {})
    setMessage(res.message ?? (res.success ? '攻撃した！' : '失敗しました。'))
    if (res.success) load()
    setLoading(false)
  }

  const handleGacha = async () => {
    setLoading(true)
    setGachaResult('')
    const res = await api.post<{ success: boolean; result?: string; message?: string }>('/game/raid/gacha', {})
    setGachaResult(res.result ?? res.message ?? '')
    if (res.success) load()
    setLoading(false)
  }

  const hpPct = boss ? Math.max(0, Math.min(100, (Number(boss.currentHp) / Number(boss.maxHp)) * 100)) : 0
  const hpColor = hpPct > 50 ? 'bg-red-500' : hpPct > 20 ? 'bg-orange-500' : 'bg-red-800'

  // 自分のギルドの合計ダメージ（ランキング1位が自ギルドとは限らないのでcontribsから算出）
  const myGuildTotal = contribs.reduce((s, c) => s + Number(c.raidDamageTotal), 0)

  return (
    <div className="space-y-3">
      {/* タブ */}
      <div className="flex gap-1">
        {([
          { key: 'boss', label: '🐲 レイドボス' },
          { key: 'ranking', label: '🏆 ランキング' },
          { key: 'guild', label: '⚔️ ギルド' },
          { key: 'gacha', label: '🎲 ガチャ' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-xs rounded font-bold transition-colors ${tab === t.key ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ボス情報 */}
      {tab === 'boss' && (
        <div className="space-y-3">
          {!boss ? (
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-8 text-center">
              <p className="text-stone-500 text-4xl mb-3">💤</p>
              <p className="text-stone-400">現在レイドボスは出現していません。</p>
              <p className="text-stone-600 text-xs mt-2">管理者がボスをスポーンすると挑戦できます。</p>
            </div>
          ) : (
            <>
              <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-red-300 font-bold text-xl">{boss.name}</h3>
                    <span className="text-xs bg-red-900 px-2 py-0.5 rounded text-red-200">{ELEMENT_LABELS[boss.element] ?? boss.element}属性</span>
                  </div>
                  <div className="text-right text-xs text-stone-400">
                    <p>物理防御: <span className="text-orange-400 font-bold">{boss.physDef.toLocaleString()}</span></p>
                    <p>魔法防御: <span className="text-purple-400 font-bold">{boss.magDef.toLocaleString()}</span></p>
                  </div>
                </div>
                {/* HPバー */}
                <div>
                  <div className="flex justify-between text-xs text-stone-400 mb-1">
                    <span>HP</span>
                    <span>{Number(boss.currentHp).toLocaleString()} / {Number(boss.maxHp).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-4">
                    <div className={`${hpColor} h-4 rounded-full transition-all duration-500`} style={{ width: `${hpPct}%` }} />
                  </div>
                </div>
                {/* 期限 */}
                <p className="text-stone-500 text-xs">討伐期限: {new Date(boss.endsAt).toLocaleString('ja-JP')}</p>
              </div>

              {/* メッセージ */}
              {message && (
                <div className={`p-3 rounded text-sm ${message.includes('失敗') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                  {message}
                </div>
              )}

              {/* マイルストーン */}
              <div className="bg-stone-900 border border-stone-700 rounded-lg p-3">
                <p className="text-stone-400 text-xs mb-2 font-bold">ギルド累計ダメージ報酬</p>
                <div className="space-y-1">
                  {MILESTONES.map(m => (
                    <div key={m} className={`flex justify-between text-xs px-2 py-1 rounded ${myGuildTotal >= m ? 'bg-amber-900/50 text-amber-300' : 'text-stone-500'}`}>
                      <span>{myGuildTotal >= m ? '✅' : '○'} {m.toLocaleString()} ダメージ</span>
                    </div>
                  ))}
                </div>
                <p className="text-stone-600 text-xs mt-2">ギルド累計: {myGuildTotal.toLocaleString()}</p>
              </div>

              <button
                onClick={handleAttack}
                disabled={loading}
                className="w-full py-3 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold rounded-lg text-sm"
              >
                ⚔️ レイドボスを攻撃する！
              </button>
            </>
          )}
        </div>
      )}

      {/* ランキング */}
      {tab === 'ranking' && (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-2">
          <h3 className="text-amber-400 font-bold">🏆 ギルド別ダメージランキング</h3>
          {ranking.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-4">まだダメージ記録がありません。</p>
          ) : ranking.map((r, i) => (
            <div key={r.guildId} className="flex justify-between items-center bg-stone-800 rounded p-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold w-6 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span className="text-stone-200 text-sm">{r.guildName}</span>
              </div>
              <span className="text-red-400 font-bold text-sm">{Number(r.totalDamage).toLocaleString()} DMG</span>
            </div>
          ))}
        </div>
      )}

      {/* ギルド貢献度 */}
      {tab === 'guild' && (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-2">
          <h3 className="text-amber-400 font-bold">⚔️ ギルドメンバー貢献度</h3>
          {contribs.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-4">ギルドに加入してレイドに参加しよう！</p>
          ) : contribs.map((c, i) => (
            <div key={i} className="flex justify-between items-center bg-stone-800 rounded p-2">
              <div>
                <span className="text-stone-200 text-sm">{c.characterName}</span>
                <span className="text-stone-500 text-xs ml-2">🎫{c.raidGachaTickets}枚</span>
              </div>
              <span className="text-red-400 font-bold text-sm">{Number(c.raidDamageTotal).toLocaleString()} DMG</span>
            </div>
          ))}
        </div>
      )}

      {/* ガチャ */}
      {tab === 'gacha' && (
        <div className="space-y-3">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-3">
            <h3 className="text-purple-400 font-bold text-lg">🎲 レイドガチャ</h3>
            <div className="text-xs text-stone-400 space-y-1 bg-stone-950 rounded p-3">
              <p>🍞 90.0% パン</p>
              <p>⭐ 5.0% Tier2クリスタル</p>
              <p>💰 4.0% 1,000G</p>
              <p>⭐⭐ 0.9% Tier3クリスタル</p>
              <p>✨✨ 0.1% <span className="text-pink-400 font-bold">レイドボス専用属性貫通クリスタル</span></p>
            </div>
            <div className="flex items-center justify-between bg-amber-950/50 border border-amber-800 rounded p-3">
              <span className="text-amber-300 text-sm">🎫 所持ガチャ券</span>
              <span className="text-amber-300 font-bold text-lg">{tickets}枚</span>
            </div>
            {gachaResult && (
              <div className="bg-purple-900/60 border border-purple-700 rounded p-3 text-purple-200 text-sm text-center font-bold">
                {gachaResult}
              </div>
            )}
            <button
              onClick={handleGacha}
              disabled={loading || tickets < 1}
              className="w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-bold rounded-lg text-sm"
            >
              🎲 ガチャを1回引く（券1枚消費）
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
