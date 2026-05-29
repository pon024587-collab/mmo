import { useState, useEffect } from 'react'
import AdminMonsterPage from './AdminMonsterPage.js'
import AdminItemPage from './AdminItemPage.js'

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
  const [tab, setTab] = useState<'players' | 'items' | 'actions' | 'raid' | 'monsters' | 'customItems'>('players')
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

  // レイド召喚フォーム
  const [raidName, setRaidName] = useState('古の魔竜')
  const [raidElement, setRaidElement] = useState('FIRE')
  const [raidMaxHp, setRaidMaxHp] = useState('1000000')
  const [raidPhysDef, setRaidPhysDef] = useState('500')
  const [raidMagDef, setRaidMagDef] = useState('500')
  const [raidDuration, setRaidDuration] = useState('72')

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

  const handleDeletePlayer = async (playerId: string, ban: boolean) => {
    const actionName = ban ? 'BAN' : 'データ削除'
    if (!window.confirm(`本当にこのプレイヤーを${actionName}しますか？この操作は元に戻せません。`)) return
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/delete-player', 'POST', { playerId, ban }, secret)
    setMessage(res.message ?? '')
    if (res.success) loadData()
  }

  const handleSpawnRaid = async () => {
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/raid/spawn', 'POST', {
      name: raidName,
      element: raidElement,
      maxHp: parseInt(raidMaxHp) || 1000000,
      physDef: parseInt(raidPhysDef) || 500,
      magDef: parseInt(raidMagDef) || 500,
      durationHours: parseInt(raidDuration) || 72
    }, secret)
    setMessage(res.message ?? (res.success ? 'レイドボスを召喚しました！' : 'エラーが発生しました。'))
  }

  const handleTerminateRaid = async () => {
    if (!window.confirm('現在のレイドボスを強制終了させますか？')) return
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/raid/terminate', 'POST', undefined, secret)
    setMessage(res.message ?? '')
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
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['players', 'items', 'actions', 'raid', 'monsters', 'customItems'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 rounded text-sm ${tab === t ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
              {t === 'players' ? 'プレイヤー' : t === 'items' ? 'アイテム付与' : t === 'raid' ? 'レイド' : t === 'monsters' ? '👹カスタム魔物' : t === 'customItems' ? '⚔️カスタムアイテム' : '操作'}
            </button>
          ))}
        </div>

        {/* カスタム魔物 */}
        {tab === 'monsters' && <AdminMonsterPage secret={secret} />}

        {/* カスタムアイテム */}
        {tab === 'customItems' && <AdminItemPage secret={secret} />}

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
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleDeletePlayer(p.id, false)} className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-100 text-xs rounded">
                    キャラデータ削除
                  </button>
                  <button onClick={() => handleDeletePlayer(p.id, true)} className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs rounded">
                    アカウントBAN
                  </button>
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

        {/* レイド管理 */}
        {tab === 'raid' && (
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
              <h3 className="text-amber-400 font-bold mb-3">🐲 レイドボス召喚</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-stone-400 text-xs block mb-1">ボス名</label>
                  <input type="text" value={raidName} onChange={e => setRaidName(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm" />
                </div>
                <div>
                  <label className="text-stone-400 text-xs block mb-1">属性</label>
                  <select value={raidElement} onChange={e => setRaidElement(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm">
                    {['FIRE', 'WATER', 'WIND', 'EARTH', 'THUNDER', 'ICE', 'LIGHT', 'DARK', 'POISON'].map(el => (
                      <option key={el} value={el}>{el}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-stone-400 text-xs block mb-1">最大HP</label>
                  <input type="number" value={raidMaxHp} onChange={e => setRaidMaxHp(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm" />
                </div>
                <div>
                  <label className="text-stone-400 text-xs block mb-1">出現時間（時間）</label>
                  <input type="number" value={raidDuration} onChange={e => setRaidDuration(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm" />
                </div>
                <div>
                  <label className="text-stone-400 text-xs block mb-1">物理防御力</label>
                  <input type="number" value={raidPhysDef} onChange={e => setRaidPhysDef(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm" />
                </div>
                <div>
                  <label className="text-stone-400 text-xs block mb-1">魔法防御力</label>
                  <input type="number" value={raidMagDef} onChange={e => setRaidMagDef(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-stone-100 text-sm" />
                </div>
              </div>
              <button onClick={handleSpawnRaid} className="w-full py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded">
                ボスを世界に放つ
              </button>
            </div>

            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
              <h3 className="text-stone-300 font-medium mb-3">⚠️ 危険な操作</h3>
              <button onClick={handleTerminateRaid} className="w-full py-2 bg-stone-800 hover:bg-red-900 text-red-400 border border-red-900 hover:border-red-600 rounded">
                出現中のレイドボスを強制終了（HP0扱いにはなりません）
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
