import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Message { id: string; senderName: string; content: string; sentAt: string }

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    api.get<{ success: boolean; messages?: Message[] }>('/social/message/inbox').then(r => {
      if (r.success && r.messages) setMessages(r.messages)
    })
  }, [])

  return (
    <div className="space-y-3">
      <h2 className="text-amber-400 font-bold">💬 メッセージ</h2>
      {messages.length === 0 && <p className="text-stone-600 text-sm text-center py-4">メッセージがありません。</p>}
      {messages.map(m => (
        <div key={m.id} className="bg-stone-900 border border-stone-700 rounded p-3">
          <div className="flex justify-between mb-1">
            <span className="text-amber-400 text-sm">{m.senderName}</span>
            <span className="text-stone-600 text-xs">{new Date(m.sentAt).toLocaleString('ja-JP')}</span>
          </div>
          <p className="text-stone-300 text-sm">{m.content}</p>
        </div>
      ))}
    </div>
  )
}
