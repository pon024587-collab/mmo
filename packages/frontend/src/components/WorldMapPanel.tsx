import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Village {
  id: string
  name: string
  nationId: string
  developmentLevel: number
  currentWeather: string
}

interface Nation {
  id: string
  name: string
}

interface WorldData {
  nations: Nation[]
  villages: Village[]
}

const WEATHER_EMOJI: Record<string, string> = {
  CLEAR: '☀️', CLOUDY: '☁️', RAIN: '🌧️', STORM: '⛈️', SNOW: '❄️',
}

interface Props {
  onMove: (villageId: string, villageName: string) => void
  isBusy: boolean
}

export default function WorldMapPanel({ onMove, isBusy }: Props) {
  const [world, setWorld] = useState<WorldData | null>(null)
  const [selectedNation, setSelectedNation] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [ambushMode, setAmbushMode] = useState(false)
  const [ambushVillageA, setAmbushVillageA] = useState<{ id: string; name: string } | null>(null)
  const [ambushVillageB, setAmbushVillageB] = useState<{ id: string; name: string } | null>(null)
  const [maxAttacks, setMaxAttacks] = useState(3)

  useEffect(() => {
    api.get<{ success: boolean } & WorldData>('/game/world').then(res => {
      if (res.success) setWorld(res)
    })
  }, [])

  if (!world) return <p className="text-stone-500 text-sm">読み込み中...</p>

  const filteredVillages = selectedNation
    ? world.villages.filter(v => v.nationId === selectedNation)
    : world.villages

  const handleMove = async (villageId: string, villageName: string) => {
    if (isBusy) { setMessage('現在行動中です。完了するまで移動できません。'); return }
    const res = await api.post<{ success: boolean; completionTime?: string; message?: string }>(
      '/game/action', { actionType: 'MOVE', parameters: { targetVillageId: villageId } }
    )
    if (res.success) {
      const time = res.completionTime ? new Date(res.completionTime).toLocaleTimeString('ja-JP') : ''
      setMessage(`${villageName}へ移動開始。完了予定: ${time}`)
      onMove(villageId, villageName)
    } else {
      setMessage(res.message ?? '移動できませんでした。')
    }
  }

  const handleAmbushSelect = (village: Village) => {
    if (!ambushVillageA) {
      setAmbushVillageA({ id: village.id, name: village.name })
      setMessage(`出発地点: ${village.name} を選択。次に目的地を選択してください。`)
    } else if (!ambushVillageB && village.id !== ambushVillageA.id) {
      setAmbushVillageB({ id: village.id, name: village.name })
      setMessage(`${ambushVillageA.name} ↔ ${village.name} の道に潜みます。攻撃回数を設定して実行してください。`)
    }
  }

  const handleAmbush = async () => {
    if (!ambushVillageA || !ambushVillageB) { setMessage('2つの村を選択してください。'); return }
    if (!window.confirm(`⚠️ 犯罪行為です。${ambushVillageA.name}↔${ambushVillageB.name}の道に潜みます。賞金首になります。実行しますか？`)) return

    const res = await api.post<{ success: boolean; message?: string; completionTime?: string }>(
      '/pvp/ambush', {
        routeVillageA: ambushVillageA.id,
        routeVillageB: ambushVillageB.id,
        maxAttacks,
      }
    )
    if (res.success) {
      setMessage(`道中に潜んだ。最大${maxAttacks}回の襲撃が可能。`)
      setAmbushMode(false)
      setAmbushVillageA(null)
      setAmbushVillageB(null)
    } else {
      setMessage(res.message ?? '潜めませんでした。')
    }
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('できません') || message.includes('失敗') ? 'bg-red-900 text-red-300' : message.includes('⚠️') || message.includes('潜') ? 'bg-amber-950 text-amber-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* モード切替 */}
      <div className="flex gap-2">
        <button
          onClick={() => { setAmbushMode(false); setAmbushVillageA(null); setAmbushVillageB(null); setMessage('') }}
          className={`flex-1 py-2 text-sm rounded ${!ambushMode ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}
        >
          🗺️ 移動
        </button>
        <button
          onClick={() => { setAmbushMode(true); setAmbushVillageA(null); setAmbushVillageB(null); setMessage('道に潜む出発地点の村を選択してください。') }}
          className={`flex-1 py-2 text-sm rounded ${ambushMode ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400'}`}
        >
          🦹 道中に潜む
        </button>
      </div>

      {/* 潜む設定 */}
      {ambushMode && ambushVillageA && ambushVillageB && (
        <div className="bg-stone-900 border border-red-800 rounded p-3 space-y-2">
          <p className="text-red-300 text-sm">{ambushVillageA.name} ↔ {ambushVillageB.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-sm">最大攻撃回数:</span>
            <select
              value={maxAttacks}
              onChange={e => setMaxAttacks(parseInt(e.target.value))}
              className="bg-stone-800 text-stone-200 text-sm rounded px-2 py-1"
            >
              {[1,2,3,5,10].map(n => <option key={n} value={n}>{n}回</option>)}
            </select>
          </div>
          <button onClick={handleAmbush} className="w-full py-2 bg-red-800 hover:bg-red-700 text-white text-sm rounded">
            この道に潜む（犯罪行為）
          </button>
        </div>
      )}

      {/* 国家フィルター */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedNation(null)}
          className={`px-3 py-1 rounded text-xs ${!selectedNation ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}
        >
          全て
        </button>
        {world.nations.map(n => (
          <button
            key={n.id}
            onClick={() => setSelectedNation(n.id)}
            className={`px-3 py-1 rounded text-xs ${selectedNation === n.id ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}
          >
            {n.name}
          </button>
        ))}
      </div>

      {/* 村一覧 */}
      <div className="space-y-2">
        {filteredVillages.map(v => {
          const nation = world.nations.find(n => n.id === v.nationId)
          const isAmbushA = ambushVillageA?.id === v.id
          const isAmbushB = ambushVillageB?.id === v.id
          return (
            <div key={v.id} className={`bg-stone-900 border rounded p-3 flex justify-between items-center ${isAmbushA || isAmbushB ? 'border-red-700' : 'border-stone-700'}`}>
              <div>
                <span className="text-stone-200 text-sm">{v.name}</span>
                {isAmbushA && <span className="text-red-400 text-xs ml-2">出発地点</span>}
                {isAmbushB && <span className="text-red-400 text-xs ml-2">目的地</span>}
                <span className="text-stone-500 text-xs ml-2">{nation?.name}</span>
                <span className="ml-2">{WEATHER_EMOJI[v.currentWeather] ?? ''}</span>
                <span className="text-stone-600 text-xs ml-2">Lv.{v.developmentLevel}</span>
              </div>
              {ambushMode ? (
                <button
                  onClick={() => handleAmbushSelect(v)}
                  disabled={isAmbushA || isAmbushB || !!ambushVillageB}
                  className="px-3 py-1 bg-red-900 hover:bg-red-800 disabled:opacity-40 text-red-300 text-xs rounded"
                >
                  {isAmbushA ? '出発地点✓' : isAmbushB ? '目的地✓' : '選択'}
                </button>
              ) : (
                <button
                  onClick={() => handleMove(v.id, v.name)}
                  disabled={isBusy}
                  className="px-3 py-1 bg-stone-700 hover:bg-stone-600 disabled:opacity-40 text-stone-300 text-xs rounded"
                >
                  移動
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
