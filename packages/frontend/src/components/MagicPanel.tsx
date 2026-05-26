import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Spell {
  id: string
  name: string
  description: string
  mpCost: number
  exp: number
  rank?: string
}

function getSkillRank(exp: number): string {
  if (exp >= 10000) return '神級'
  if (exp >= 5000) return '聖級'
  if (exp >= 2000) return '上級'
  if (exp >= 500) return '中級'
  if (exp >= 100) return '普通'
  return '初級'
}

const SPELL_ICONS: Record<string, string> = {
  HEAL: '💚',
  PURIFY: '✨',
}

const SPELL_COLORS: Record<string, string> = {
  HEAL: 'border-green-700 bg-green-950/20',
  PURIFY: 'border-blue-700 bg-blue-950/20',
}

export default function MagicPanel() {
  const [spells, setSpells] = useState<Spell[]>([])
  const [mp, setMp] = useState(0)
  const [mpMax, setMpMax] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchSpells = async () => {
    const res = await api.get<{ success: boolean; spells?: Spell[]; mp?: number; mpMax?: number }>('/game/magic/spells')
    if (res.success) {
      setSpells(res.spells ?? [])
      setMp(res.mp ?? 0)
      setMpMax(res.mpMax ?? 0)
    }
  }

  useEffect(() => { fetchSpells() }, [])

  const handleCast = async (spellId: string) => {
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/magic/cast', { spellId })
    setMessage(res.message ?? '')
    if (res.success) fetchSpells()
    setLoading(false)
  }

  const mpPercent = mpMax > 0 ? Math.round((mp / mpMax) * 100) : 0

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('足りません') || message.includes('習得していません') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* MPバー */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-400 font-bold">💙 MP</span>
          <span className="text-blue-300 font-mono">{mp} / {mpMax}</span>
        </div>
        <div className="w-full bg-stone-800 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${mpPercent}%`,
              background: 'linear-gradient(to right, #1d4ed8, #60a5fa)'
            }}
          />
        </div>
        <p className="text-stone-500 text-xs mt-2">MPは時間経過で自然回復します。休息を取るとより早く回復します。</p>
      </div>

      {/* アクティブスペル一覧 */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-purple-400 font-bold mb-3">🔮 使用可能な魔法</h2>

        {spells.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-stone-500 text-sm mb-2">使用できる回復・支援魔法がありません。</p>
            <p className="text-stone-600 text-xs">
              💡 魔法は魔物との戦闘で自動的に成長します。<br />
              <span className="text-green-600">治癒魔法</span>: ウェアウルフ等の生命系の魔物を倒すと<strong>生命魔法スキル</strong>が育ちます。<br />
              <span className="text-blue-600">浄化魔法</span>: 堕天使などの光系の魔物を倒すと<strong>光魔法スキル</strong>が育ちます。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {spells.map(spell => {
              const rank = getSkillRank(spell.exp)
              const powerBonus = Math.floor(Math.sqrt(spell.exp))
              const canCast = mp >= spell.mpCost

              return (
                <div key={spell.id} className={`border rounded-lg p-4 ${SPELL_COLORS[spell.id] ?? 'border-stone-700'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{SPELL_ICONS[spell.id] ?? '🔮'}</span>
                        <span className="text-white font-bold">{spell.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded border border-amber-700 text-amber-400">{rank}</span>
                      </div>
                      <p className="text-stone-400 text-sm">{spell.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-stone-500">
                        <span className="text-blue-400">MP: {spell.mpCost}</span>
                        <span className="text-purple-400">効果ボーナス: +{powerBonus}</span>
                        <span>EXP: {spell.exp.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCast(spell.id)}
                      disabled={!canCast || loading}
                      className={`px-4 py-2 rounded font-bold text-sm transition-colors ${
                        canCast && !loading
                          ? 'bg-purple-700 hover:bg-purple-600 text-white'
                          : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {loading ? '詠唱中...' : '発動'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* スキル成長ガイド */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-stone-400 font-bold text-sm mb-3">📖 魔法スキル成長ガイド</h2>
        <div className="space-y-2 text-xs text-stone-500">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-stone-950 rounded p-2">
              <span className="text-green-400 font-bold">💚 生命魔法 → 治癒魔法解放</span>
              <p className="mt-1">ウェアウルフ・スライムなど<br/>「生命系」の魔物を狩る</p>
            </div>
            <div className="bg-stone-950 rounded p-2">
              <span className="text-blue-400 font-bold">✨ 光魔法 → 浄化魔法解放</span>
              <p className="mt-1">堕天使など<br/>「光系」の魔物を狩る</p>
            </div>
          </div>
          <p className="text-stone-600 text-center">スキルランクが上がるほど魔法の効果が強化されます</p>
        </div>
      </div>
    </div>
  )
}
