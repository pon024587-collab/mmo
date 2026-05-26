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

  return (
    <div className="space-y-3">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('できません') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
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
          return (
            <div key={v.id} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
              <div>
                <span className="text-stone-200 text-sm">{v.name}</span>
                <span className="text-stone-500 text-xs ml-2">{nation?.name}</span>
                <span className="ml-2">{WEATHER_EMOJI[v.currentWeather] ?? ''}</span>
                <span className="text-stone-600 text-xs ml-2">Lv.{v.developmentLevel}</span>
              </div>
              <button
                onClick={() => handleMove(v.id, v.name)}
                disabled={isBusy}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 disabled:opacity-40 text-stone-300 text-xs rounded"
              >
                移動
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
