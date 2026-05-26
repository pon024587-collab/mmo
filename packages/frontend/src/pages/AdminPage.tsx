import { useState, useEffect } from 'react'

const API_BASE = (import.meta.env['VITE_API_URL'] as string | undefined)
  ? `${import.meta.env['VITE_API_URL']}/api`
  : '/api'

interface Character { id: string; name: string; status: string; gold: number; villageName: string }
interface Player { id: string; email: string; characterName: string; age: number; gold: number; villageName: string; nationName: string; status: string; health: number; bountyAmount: number }
interface Item { name: string; category: string; basePrice: number }

async function adminFetch<T>(path: string, method = 'GET', body?: unknown, secret = ''): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<T>
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'players' | 'items' | 'actions'>('players')
  const [players, setPlayers] = useState<Player[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [message, setMessage] = useState('')
  const [selectedCharId, setSelectedCharId] = useState('')

  // アイテム付与フォーム
  const [giveItemName, setGiveItemName] = useState('')
  const [giveItemQty, setGiveItemQty] = useState(1)

  // ステータス操作フォーム
  const [setHealth, setSetHealth] = useState('')
  const [setGold, setSetGold] = useState('')
  const [setCombat, setSetCombat] = useState('')
  const [setFarming, setSetFarming] = useState('')

  const handleAuth = async () => {
    const res = await adminFetch<{ success: boolean }>('/admin/players', 'GET', undefined, secret)
    if (res.success) { setAuthed(true); loadData() }
    else setMessage('認証失敗。シークレットが違います。')
  }

  const loadData = async () => {
    const [p, c, i] = await Promise.all([
      adminFetch<{ success: boolean; players?: Player[] }>('/admin/players', 'GET', undefined, secret),
      adminFetch<{ success: boolean; characters?: Character[] }>('/admin/characters', 'GET', undefined, secret),
      adminFetch<{ success: boolean; items?: Item[] }>('/admin/items', 'GET', undefined, secret),
    ])
    if (p.success) setPlayers(p.players ?? [])
    if (c.success) setCharacters(c.characters ?? [])
    if (i.success) setItems(i.items ?? [])
  }

  const handleTick = async (times: number) => {
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/tick', 'POST', { times }, secret)
    setMessage(res.message ?? '')
  }

  const handleGiveItem = async () => {
    if (!selectedCharId || !giveItemName) { setMessage('キャラクターとアイテムを選択してください。'); return }
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/give-item', 'POST', { characterId: selectedCharId, itemName: giveItemName, quantity: giveItemQty }, secret)
    setMessage(res.message ?? '')
  }

  const handleSetStatus = async () => {
    if (!selectedCharId) { setMessage('キャラクターを選択してください。'); return }
    const body: Record<string, number | string> = { characterId: selectedCharId }
    if (setHealth) body['health'] = parseInt(setHealth)
    if (setGold) body['gold'] = parseInt(setGold)
    if (setCombat) body['skillCombatGrowth'] = parseInt(setCombat)
    if (setFarming) body['skillFarmingGrowth'] = parseInt(setFarming)
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/set-status', 'POST', body, secret)
    setMessage(res.message ?? '')
  }

  const handleCompleteAction = async () => {
    if (!selectedCharId) { setMessage('キャラクターを選択してください。'); return }
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/complete-action', 'POST', { characterId: selectedCharId }, secret)
    setMessage(res.message ?? '')
  }

  const handleSpawnMonster = async (monsterType: string) => {
    if (!selectedCharId) { setMessage('キャラクターを選択してください。'); return }
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/spawn-monster', 'POST', { characterId: selectedCharId, monsterType, count: 1 }, secret)
    setMessage(res.message ?? '')
  }

  const handleReleasePrisoner = async () => {
    if (!selectedCharId) { setMessage('キャラクターを選択してください。'); return }
    if (!window.confirm('このキャラクターを釈放しますか？')) return
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/release-prisoner', 'POST', { characterId: selectedCharId }, secret)
    setMessage(res.message ?? '')
    if (res.success) loadData()
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-8 w-full max-w-sm">
          <h1 className="text-amber-400 font-bold text-xl mb-6 text-center">🔐 管理者ログイン</h1>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="管理者シークレット"
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 mb-3"
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
          />
          {message && <p className="text-red-400 text-sm mb-3">{message}</p>}
          <button onClick={handleAuth} className="w-full bg-amber-700 hover:bg-amber-600 text-white py-2 rounded">ログイン</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-amber-400 font-bold text-xl mb-4">⚙️ 管理者テストモード</h1>

        {message && (
          <div className="bg-stone-800 border border-amber-700 rounded p-3 text-amber-300 text-sm mb-4">{message}</div>
        )}

        {/* クイックアクション */}
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 mb-4">
          <h2 className="text-stone-300 font-medium mb-3">⏩ 時間スキップ</h2>
          <div className="flex gap-2 flex-wrap">
            {[1, 3, 7, 24].map(n => (
              <button key={n} onClick={() => handleTick(n)}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm rounded">
                {n}時間進める
              </button>
            ))}
          </div>
        </div>

        {/* キャラクター選択 */}
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 mb-4">
          <h2 className="text-stone-300 font-medium mb-3">👤 キャラクター選択</h2>
          <select
            value={selectedCharId}
            onChange={e => setSelectedCharId(e.target.value)}
            className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm"
          >
            <option value="">-- キャラクターを選択 --</option>
            {characters.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.villageName}) - {c.status}</option>
            ))}
          </select>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-4">
          {(['players', 'items', 'actions'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded text-sm ${tab === t ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
              {t === 'players' ? 'プレイヤー一覧' : t === 'items' ? 'アイテム付与' : '操作'}
            </button>
          ))}
        </div>

        {/* プレイヤー一覧 */}
        {tab === 'players' && (
          <div className="space-y-2">
            {players.map(p => (
              <div key={p.id} className="bg-stone-900 border border-stone-700 rounded p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-amber-400 font-medium">{p.characterName ?? '（キャラなし）'}</span>
                  <span className="text-stone-500">{p.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-stone-400">
                  <span>年齢: {p.age}歳</span>
                  <span>所持金: {p.gold}G</span>
                  <span>体力: {p.health}</span>
                  <span>{p.nationName} / {p.villageName}</span>
                  <span>状態: {p.status}</span>
                  {p.bountyAmount > 0 && <span className="text-red-400">賞金: {p.bountyAmount}G</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* アイテム付与 */}
        {tab === 'items' && (
          <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-stone-400 text-sm block mb-1">アイテム名</label>
              <input
                list="item-list"
                value={giveItemName}
                onChange={e => setGiveItemName(e.target.value)}
                placeholder="アイテム名を入力..."
                className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm"
              />
              <datalist id="item-list">
                {items.map(i => <option key={i.name} value={i.name}>{i.name} ({i.category})</option>)}
              </datalist>
            </div>
            <div>
              <label className="text-stone-400 text-sm block mb-1">数量</label>
              <input type="number" min={1} max={999} value={giveItemQty} onChange={e => setGiveItemQty(parseInt(e.target.value))}
                className="w-32 bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm" />
            </div>
            <button onClick={handleGiveItem} className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded">
              アイテムを付与
            </button>
          </div>
        )}

        {/* 操作 */}
        {tab === 'actions' && (
          <div className="space-y-4">
            {/* ステータス操作 */}
            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
              <h3 className="text-stone-300 font-medium mb-3">📊 ステータス操作</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: '体力', value: setHealth, setter: setSetHealth },
                  { label: '所持金', value: setGold, setter: setSetGold },
                  { label: '戦闘スキル', value: setCombat, setter: setSetCombat },
                  { label: '農業スキル', value: setFarming, setter: setSetFarming },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-stone-500 text-xs block mb-1">{f.label}</label>
                    <input type="number" value={f.value} onChange={e => f.setter(e.target.value)} placeholder="変更しない"
                      className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1.5 text-stone-100 text-sm" />
                  </div>
                ))}
              </div>
              <button onClick={handleSetStatus} className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 text-sm rounded">
                ステータスを更新
              </button>
            </div>

            {/* 行動操作 */}
            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
              <h3 className="text-stone-300 font-medium mb-3">⚡ 行動操作 / 状態異常解除</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleCompleteAction} className="py-2 bg-green-800 hover:bg-green-700 text-white text-sm rounded mb-2">
                  実行中の行動を即完了
                </button>
                <button onClick={handleReleasePrisoner} className="py-2 bg-blue-800 hover:bg-blue-700 text-white text-sm rounded mb-2">
                  投獄状態を解除（釈放）
                </button>
              </div>
            </div>

            {/* 魔物召喚 */}
            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
              <h3 className="text-stone-300 font-medium mb-3">👹 魔物召喚</h3>
              <div className="grid grid-cols-3 gap-2">
                {['GOBLIN', 'ORC', 'WOLF', 'BANDIT', 'TROLL', 'DRAGON'].map(m => (
                  <button key={m} onClick={() => handleSpawnMonster(m)}
                    className="py-2 bg-red-900 hover:bg-red-800 text-red-300 text-xs rounded">
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
