import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client.js'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchChat = async () => {
    const res = await api.get<{ success: boolean; messages?: ChatMessage[] }>('/game/chat')
    if (res.success && res.messages) {
      setMessages(res.messages)
    }
  }

  useEffect(() => {
    fetchChat()
    // 5秒ごとにポーリング
    const interval = setInterval(fetchChat, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)
    const res = await api.post<{ success: boolean }>('/game/chat/send', { content })
    if (res.success) {
      setContent('')
      fetchChat()
    }
    setLoading(false)
  }

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg flex flex-col h-[600px]">
      <div className="p-3 border-b border-stone-700 bg-stone-800 rounded-t-lg">
        <h2 className="text-amber-400 font-bold text-sm">💬 村チャット</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-stone-500 text-sm text-center py-10">まだメッセージがありません。</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-stone-950 p-3 rounded-lg border border-stone-800">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-amber-300 font-bold text-sm">{msg.senderName}</span>
                <span className="text-stone-500 text-xs">{new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-stone-200 text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-stone-700 bg-stone-800 rounded-b-lg flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 bg-stone-950 border border-stone-700 rounded p-2 text-sm text-stone-200"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 text-white font-bold rounded text-sm"
        >
          送信
        </button>
      </form>
    </div>
  )
}
