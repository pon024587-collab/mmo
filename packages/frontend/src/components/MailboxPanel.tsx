import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

interface Mail {
  id: string
  sender: string
  subject: string
  body: string
  rewardGold: number
  rewardItems: { name: string; qty: number }[]
  isRead: boolean
  isClaimed: boolean
  createdAt: string
}

export default function MailboxPanel() {
  const [mails, setMails] = useState<Mail[]>([])
  const [selected, setSelected] = useState<Mail | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => {
    api.get<{ success: boolean; mails?: Mail[] }>('/game/mailbox').then(r => {
      if (r.success && r.mails) setMails(r.mails)
    })
  }

  useEffect(() => { load() }, [])

  const handleClaim = async (mailId: string) => {
    setLoading(true)
    const res = await api.post<{ success: boolean; message?: string }>('/game/mailbox/claim', { mailId })
    setMessage(res.message ?? '')
    if (res.success) { load(); setSelected(null) }
    setLoading(false)
  }

  const unread = mails.filter(m => !m.isRead).length
  const unclaimed = mails.filter(m => !m.isClaimed && (m.rewardGold > 0 || m.rewardItems.length > 0)).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-amber-400 font-bold text-lg">
          📬 メールボックス
          {unread > 0 && <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{unread}件未読</span>}
          {unclaimed > 0 && <span className="ml-2 bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">受取{unclaimed}件</span>}
        </h2>
      </div>

      {message && (
        <div className="bg-green-900/60 text-green-300 border border-green-700 rounded p-3 text-sm">{message}</div>
      )}

      {mails.length === 0 ? (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-8 text-center text-stone-500 text-sm">
          メールはありません
        </div>
      ) : (
        <div className="space-y-2">
          {mails.map(mail => (
            <div
              key={mail.id}
              onClick={() => setSelected(mail)}
              className={`cursor-pointer rounded-lg p-3 border transition-colors ${
                !mail.isRead ? 'bg-amber-950/40 border-amber-800' : 'bg-stone-900 border-stone-700'
              } hover:border-amber-600`}
            >
              <div className="flex justify-between items-start">
                <div>
                  {!mail.isRead && <span className="text-xs bg-red-600 text-white px-1 rounded mr-2">新着</span>}
                  <span className="text-stone-200 text-sm font-medium">{mail.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!mail.isClaimed && (mail.rewardGold > 0 || mail.rewardItems.length > 0) && (
                    <span className="text-xs bg-amber-700 text-amber-100 px-2 py-0.5 rounded">報酬あり</span>
                  )}
                  <span className="text-stone-600 text-xs">{new Date(mail.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
              <p className="text-stone-500 text-xs mt-1">{mail.sender}</p>
            </div>
          ))}
        </div>
      )}

      {/* メール詳細モーダル */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-stone-900 border border-stone-600 rounded-xl p-5 max-w-md w-full space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-amber-300 font-bold text-lg">{selected.subject}</h3>
            <p className="text-stone-400 text-xs">送信者: {selected.sender} / {new Date(selected.createdAt).toLocaleString('ja-JP')}</p>
            <p className="text-stone-200 text-sm whitespace-pre-line">{selected.body}</p>
            {(selected.rewardGold > 0 || selected.rewardItems.length > 0) && (
              <div className="bg-amber-950/50 border border-amber-800 rounded p-3 space-y-1">
                <p className="text-amber-400 text-xs font-bold">🎁 報酬内容</p>
                {selected.rewardGold > 0 && <p className="text-amber-300 text-sm">💰 {selected.rewardGold}G</p>}
                {selected.rewardItems.map((item, i) => (
                  <p key={i} className="text-stone-200 text-sm">📦 {item.name} × {item.qty}</p>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {!selected.isClaimed && (selected.rewardGold > 0 || selected.rewardItems.length > 0) && (
                <button
                  onClick={() => handleClaim(selected.id)}
                  disabled={loading}
                  className="flex-1 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-sm rounded font-bold"
                >
                  報酬を受け取る
                </button>
              )}
              {selected.isClaimed && (
                <p className="flex-1 text-center text-stone-500 text-sm py-2">受取済み</p>
              )}
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm rounded">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
