import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Bounty { characterName: string; bountyAmount: number; villageId: string }
interface Prisoner { id: string; name: string; bountyAmount: number }
interface Caravan { id: string; destinationName: string; departureAt: string; passengerFee: number; guardReward: number }

export default function PvpPanel() {
  const [tab, setTab] = useState<'bounties' | 'caravans' | 'prisoners' | 'guard'>('caravans')
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [prisoners, setPrisoners] = useState<Prisoner[]>([])
  const [caravans, setCaravans] = useState<Caravan[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get<{ success: boolean; bounties?: Bounty[] }>('/pvp/bounties').then(r => { if (r.success) setBounties(r.bounties ?? []) })
    api.get<{ success: boolean; prisoners?: Prisoner[] }>('/pvp/prisoners').then(r => { if (r.success) setPrisoners(r.prisoners ?? []) })
    api.get<{ success: boolean; caravans?: Caravan[] }>('/pvp/caravans').then(r => { if (r.success) setCaravans(r.caravans ?? []) })
  }, [])

  const handleJoinCaravan = async (caravanId: string, role: 'passenger' | 'guard') => {
    const res = await api.post<{ success: boolean; message?: string }>(`/pvp/caravan/${role}`, { caravanId })
    setMessage(res.message ?? (res.success ? '参加しました。' : '参加できませんでした。'))
  }

  const handleDeliver = async (prisonerId: string) => {
    const res = await api.post<{ success: boolean; message?: string }>('/pvp/deliver', { prisonerCharacterId: prisonerId })
    setMessage(res.message ?? '')
    if (res.success) setPrisoners(prev => prev.filter(p => p.id !== prisonerId))
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className="bg-stone-800 border border-stone-600 rounded p-3 text-stone-300 text-sm">{message}</div>
      )}

      {/* タブ */}
      <div className="flex gap-1">
        {(['caravans', 'bounties', 'prisoners', 'guard'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs rounded ${tab === t ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
            {t === 'caravans' ? '商隊' : t === 'bounties' ? '賞金首' : t === 'prisoners' ? '囚人' : '衛兵所'}
          </button>
        ))}
      </div>

      {/* 商隊 */}
      {tab === 'caravans' && (
        <div className="space-y-2">
          {caravans.length === 0 && <p className="text-stone-600 text-sm text-center py-4">現在出発予定の商隊はありません。</p>}
          {caravans.map(c => (
            <div key={c.id} className="bg-stone-900 border border-stone-700 rounded p-3">
              <div className="flex justify-between mb-2">
                <span className="text-stone-200 text-sm">→ {c.destinationName}</span>
                <span className="text-stone-500 text-xs">{new Date(c.departureAt).toLocaleTimeString('ja-JP')}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleJoinCaravan(c.id, 'passenger')}
                  className="flex-1 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs rounded">
                  乗客（{c.passengerFee}G）
                </button>
                <button onClick={() => handleJoinCaravan(c.id, 'guard')}
                  className="flex-1 py-1.5 bg-amber-800 hover:bg-amber-700 text-white text-xs rounded">
                  護衛（+{c.guardReward}G）
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 賞金首 */}
      {tab === 'bounties' && (
        <div className="space-y-2">
          {bounties.length === 0 && <p className="text-stone-600 text-sm text-center py-4">現在賞金首はいません。</p>}
          {bounties.map((b, i) => (
            <div key={i} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between">
              <span className="text-stone-200 text-sm">{b.characterName}</span>
              <span className="text-amber-400 text-sm font-bold">{b.bountyAmount}G</span>
            </div>
          ))}
        </div>
      )}

      {/* 囚人 */}
      {tab === 'prisoners' && (
        <div className="space-y-2">
          {prisoners.length === 0 && <p className="text-stone-600 text-sm text-center py-4">捕まえているプレイヤーはいません。</p>}
          {prisoners.map(p => (
            <div key={p.id} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
              <div>
                <span className="text-stone-200 text-sm">{p.name}</span>
                <span className="text-amber-400 text-xs ml-2">賞金: {p.bountyAmount}G</span>
              </div>
              <button onClick={() => handleDeliver(p.id)}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded">
                引き渡す
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 衛兵所 */}
      {tab === 'guard' && (
        <div className="bg-stone-900 border border-stone-700 rounded p-4 text-sm text-stone-400">
          <p className="text-stone-300 font-medium mb-2">⚔️ 衛兵所</p>
          <p>賞金首を捕まえて引き渡すと報酬がもらえます。</p>
          <p className="mt-2">犯罪を犯すと賞金首になり、他のプレイヤーに狙われます。</p>
          <p className="mt-2">自首すると6時間の拘束で犯罪記録が消えます。</p>
        </div>
      )}
    </div>
  )
}
