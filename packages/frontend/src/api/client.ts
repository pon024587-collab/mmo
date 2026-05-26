/**
 * APIクライアント
 * 本番: VITE_API_URLのバックエンドに直接リクエスト
 * 開発: /api経由でViteプロキシ
 */

declare const __API_URL__: string

// ビルド時に埋め込まれたAPIのURL
const API_BASE = (typeof __API_URL__ !== 'undefined' && __API_URL__)
  ? `${__API_URL__}/api`
  : '/api'

console.log('[client] API_BASE:', API_BASE)

function getToken(): string | null {
  return localStorage.getItem('medieval_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const url = `${API_BASE}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json() as T
  return data
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),
}
