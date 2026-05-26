/**
 * APIクライアント
 * 開発時: /api → Viteプロキシ経由でバックエンドへ
 * 本番時: VITE_API_URLが設定されていればそちらへ直接
 */

// ビルド時に埋め込まれたAPIのURL（Railwayの環境変数から）
declare const __API_URL__: string
const API_BASE = (typeof __API_URL__ !== 'undefined' && __API_URL__)
  ? `${__API_URL__}/api`
  : '/api'

function getToken(): string | null {
  return localStorage.getItem('medieval_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok && res.status === 500) {
    throw new Error('サーバーエラーが発生しました。')
  }

  return res.json() as Promise<T>
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),
}
