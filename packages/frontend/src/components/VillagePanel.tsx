import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface VillageInfo {
  id: string
  name: string
  developmentLevel: number
  currentWeather: string
  securityLevel: number
  economyLevel: number
  foodStock: number
}

interface Land {
  id: string
  landType: string
  status: string
  purchasePrice: number
}

interface Npc { id: string; name: string; role: string }
interface Rumor { content: string; eventType: string }
interface Player { name: string; status: string }

interface VillageData {
  village: VillageInfo
  npcs: Npc[]
  rumors: Rumor[]
  players: Player[]
}

const WEATHER_EMOJI: Record<string, string> = {
  CLEAR: '☀️', CLOUDY: '☁️', RAIN: '🌧️', STORM: '⛈️', SNOW: '❄️',
}

export default function VillagePanel() {
  const [data, setData] = useState<VillageData | null>(null)
  const [lands, setLands] = useState<Land[]>([])
  const [message, setMessage] = useState('')

  const fetchVillage = () => {
    api.get<{ success: boolean } & VillageData>('/game/village').then(res => {
      if (res.success) setData(res)
    })
    api.get<{ success: boolean; lands: Land[] }>('/game/lands').then(res => {
      if (res.success) setLands(res.lands)
    })
  }

  useEffect(() => {
    fetchVillage()
  }, [])

  const handleBuyLand = async (landId: string) => {
    const res = await api.post<{ success: boolean; message?: string }>('/game/land/buy', { landId })
    setMessage(res.message ?? '')
    if (res.success) {
      fetchVillage()
    }
  }

  if (!data) return <p className="text-stone-500 text-sm">読み込み中...</p>

  const { village, npcs, rumors, players } = data

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('失敗') || message.includes('足りません') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold mb-3">
          {village.name} {WEATHER_EMOJI[village.currentWeather] ?? ''}
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-stone-500">発展度: </span><span className="text-stone-300">Lv.{village.developmentLevel}</span></div>
          <div><span className="text-stone-500">治安: </span><span className="text-stone-300">{village.securityLevel}</span></div>
          <div><span className="text-stone-500">経済: </span><span className="text-stone-300">{village.economyLevel}</span></div>
          <div><span className="text-stone-500">食料: </span><span className="text-stone-300">{village.foodStock}</span></div>
        </div>
      </div>

      {rumors.length > 0 && (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <h3 className="text-stone-400 font-medium mb-2">📢 噂話</h3>
          <ul className="space-y-1">
            {rumors.map((r, i) => (
              <li key={i} className="text-stone-400 text-sm">「{r.content}」</li>
            ))}
          </ul>
        </div>
      )}

      {npcs.length > 0 && (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <h3 className="text-stone-400 font-medium mb-2">👥 村人</h3>
          <ul className="space-y-1">
            {npcs.map(npc => (
              <li key={npc.id} className="text-stone-400 text-sm">
                {npc.name} <span className="text-stone-600">({npc.role})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {players.length > 0 && (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <h3 className="text-stone-400 font-medium mb-2">🧑 同じ村のプレイヤー</h3>
          <ul className="space-y-1">
            {players.map((p, i) => (
              <li key={i} className="text-stone-400 text-sm">
                {p.name} <span className="text-stone-600">({p.status === 'IDLE' ? '待機中' : '行動中'})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lands.length > 0 && (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <h3 className="text-stone-400 font-medium mb-2">🏘️ 不動産（土地の購入）</h3>
          <div className="space-y-2">
            {lands.map(land => (
              <div key={land.id} className="border border-stone-800 rounded p-2 flex justify-between items-center bg-stone-950">
                <div>
                  <span className="text-stone-200 text-sm">
                    {land.landType === 'RESIDENTIAL' ? '住宅地' : land.landType === 'FARM' ? '農地' : '商業地'}
                  </span>
                  <span className="text-stone-500 text-xs ml-2">({land.status === 'UNOWNED' ? '販売中' : '所有者あり'})</span>
                  <div className="text-amber-400 text-xs font-mono mt-1">価格: {land.purchasePrice}G</div>
                </div>
                {land.status === 'UNOWNED' && (
                  <button 
                    onClick={() => handleBuyLand(land.id)}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded"
                  >
                    購入
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
