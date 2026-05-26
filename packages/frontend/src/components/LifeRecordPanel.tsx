import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface LifeRecord {
  id: string
  characterName: string
  finalAge: number
  causeOfDeath: string
  deathDate: string
}

export default function LifeRecordPanel() {
  const [records, setRecords] = useState<LifeRecord[]>([])

  useEffect(() => {
    api.get<{ success: boolean; records?: LifeRecord[] }>('/game/life-records').then(r => {
      if (r.success && r.records) setRecords(r.records)
    })
  }, [])

  if (records.length === 0) {
    return <p className="text-stone-600 text-sm text-center py-8">まだ人生の記録がありません。</p>
  }

  return (
    <div className="space-y-3">
      <h2 className="text-amber-400 font-bold">📜 人生の記録</h2>
      {records.map(r => (
        <div key={r.id} className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-stone-200 font-medium">{r.characterName}</span>
            <span className="text-stone-500 text-xs">{new Date(r.deathDate).toLocaleDateString('ja-JP')}</span>
          </div>
          <p className="text-stone-400 text-sm">{r.finalAge}歳で生涯を終えた</p>
          <p className="text-stone-500 text-xs mt-1">死因: {r.causeOfDeath}</p>
        </div>
      ))}
    </div>
  )
}
