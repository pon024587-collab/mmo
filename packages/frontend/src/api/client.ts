/**
 * APIクライアント
 * VITE_API_URL環境変数でバックエンドURLを指定する
 */

// Viteの環境変数（ビルド時に埋め込まれる）
const API_BASE = (import.meta.env['VITE_API_URL'] as string | undefined)
  ? `${import.meta.env['VITE_API_URL']}/api`
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
  const data = await res.json() as T
  return data
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),
}
