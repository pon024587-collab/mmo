import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../hooks/useAuth.js'
import { collectFingerprint } from '../utils/fingerprint.js'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveToken } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fp = await collectFingerprint()
      const res = await api.post<{ success: boolean; token?: string; message?: string; character?: { villageName: string; nationName: string } }>(
        '/auth/register',
        { email, password, fingerprintSignals: fp }
      )
      if (res.success && res.token) {
        saveToken(res.token)
        navigate('/game')
      } else {
        setError(res.message ?? '登録に失敗しました。')
      }
    } catch {
      setError('接続エラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="w-full max-w-md p-8 border border-stone-700 rounded-lg bg-stone-900">
        <h1 className="text-2xl font-bold text-amber-400 mb-2 text-center">⚔️ Medieval Life</h1>
        <p className="text-stone-400 text-center text-sm mb-8">新しい人生を始める</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-stone-300 text-sm mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-stone-300 text-sm mb-1">パスワード（8文字以上）</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2 rounded transition-colors"
          >
            {loading ? '登録中...' : '新しい人生を始める'}
          </button>
        </form>

        <p className="text-stone-500 text-sm text-center mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="text-amber-400 hover:underline">ログイン</Link>
        </p>
      </div>
    </div>
  )
}
