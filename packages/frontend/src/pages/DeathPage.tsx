import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

interface LifeRecord {
  characterName: string
  finalAge: number
  causeOfDeath: string
  deathDate: string
}

export default function DeathPage() {
  const [lastLife, setLastLife] = useState<LifeRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get<{ success: boolean; records?: LifeRecord[] }>('/game/life-records').then(res => {
      if (res.success && res.records && res.records.length > 0) {
        setLastLife(res.records[0]!)
      }
    })
  }, [])

  const handleReborn = async () => {
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string; villageName?: string; nationName?: string }>(
      '/game/reborn', {}
    )
    if (res.success) {
      navigate('/game')
    } else {
      alert(res.message ?? '転生に失敗しました。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-6xl mb-4">💀</div>
        <h1 className="text-2xl font-bold text-stone-300">あなたのキャラクターは死亡しました</h1>

        {lastLife && (
          <div className="bg-stone-900 border border-stone-700 rounded-lg p-6 text-left space-y-2">
            <h2 className="text-amber-400 font-bold text-lg mb-3">📜 {lastLife.characterName} の人生</h2>
            <p className="text-stone-400 text-sm">享年: <span className="text-stone-200">{lastLife.finalAge}歳</span></p>
            <p className="text-stone-400 text-sm">死因: <span className="text-stone-200">{lastLife.causeOfDeath}</span></p>
            <p className="text-stone-400 text-sm">没日: <span className="text-stone-200">{new Date(lastLife.deathDate).toLocaleDateString('ja-JP')}</span></p>
          </div>
        )}

        <p className="text-stone-500 text-sm">
          この人生は終わりました。しかし、世界はまだ続いています。
          <br />新しい命として、再びこの世界に生まれましょう。
        </p>

        <button
          onClick={handleReborn}
          disabled={loading}
          className="w-full py-4 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-lg rounded-lg transition-colors"
        >
          {loading ? '転生中...' : '✨ 新しい人生を始める'}
        </button>

        <button
          onClick={() => navigate('/game/life-records')}
          className="text-stone-500 hover:text-stone-300 text-sm underline"
        >
          過去の人生を振り返る
        </button>
      </div>
    </div>
  )
}
