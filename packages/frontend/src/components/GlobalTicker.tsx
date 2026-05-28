import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface GlobalLog {
  message: string
  type: string
  created_at: string
}

export default function GlobalTicker() {
  const [logs, setLogs] = useState<GlobalLog[]>([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const fetch = () => {
      api.get<{ success: boolean; logs?: GlobalLog[] }>('/game/global-logs').then(r => {
        if (r.success && r.logs && r.logs.length > 0) setLogs(r.logs)
      })
    }
    fetch()
    const interval = setInterval(fetch, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logs.length === 0) return
    const t = setInterval(() => setIdx(i => (i + 1) % logs.length), 5000)
    return () => clearInterval(t)
  }, [logs])

  if (logs.length === 0) return null

  const log = logs[idx]
  const typeColor: Record<string, string> = {
    RAID:   'text-red-300 bg-red-950 border-red-800',
    CRAFT:  'text-amber-300 bg-amber-950 border-amber-800',
    COMBAT: 'text-blue-300 bg-blue-950 border-blue-800',
    INFO:   'text-stone-300 bg-stone-900 border-stone-700',
  }
  const color = typeColor[log?.type ?? 'INFO'] ?? typeColor['INFO']

  return (
    <div className={`border-b px-4 py-1.5 text-xs flex items-center gap-2 overflow-hidden ${color}`}>
      <span className="shrink-0 font-bold">📢 速報</span>
      <span className="truncate animate-pulse">{log?.message}</span>
    </div>
  )
}
