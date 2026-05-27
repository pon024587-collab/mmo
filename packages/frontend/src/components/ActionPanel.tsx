import { useState, useEffect } from 'react'
import { api } from '../api/client.js'
import { SoundManager } from '../utils/sound.js'


interface Props {
  characterId: string
  isBusy: boolean
  onActionStart: () => void
}

interface ActionGroup {
  label: string
  actions: { label: string; endpoint: string; body?: Record<string, unknown>; confirm?: string }[]
}

const ACTION_GROUPS: ActionGroup[] = [
  {
    label: '⚔️ 基礎訓練',
    actions: [
      { label: '素振り（15分）', endpoint: '/game/action', body: { actionType: 'COMBAT_PRACTICE' } },
    ],
  },
  {
    label: '🦹 犯罪行為',
    actions: [
      { label: 'NPCから盗む', endpoint: '/game/steal', body: {}, confirm: '⚠️ 犯罪行為です。賞金首になります。本当に実行しますか？' },
    ],
  },
  {
    label: '🪨 採集',
    actions: [
      { label: '採掘（1時間）', endpoint: '/game/gather', body: { gatherType: 'MINE' } },
      { label: '木を切る（45分）', endpoint: '/game/gather', body: { gatherType: 'CHOP_WOOD' } },
      { label: '薬草を摘む（30分）', endpoint: '/game/gather', body: { gatherType: 'GATHER_HERBS' } },
      { label: '釣り（45分）', endpoint: '/game/gather', body: { gatherType: 'FISH' } },
    ],
  },
  {
    label: '🍞 生存',
    actions: [
      { label: '水を飲む（3分）', endpoint: '/game/drink' },
      { label: '睡眠（3.5時間）', endpoint: '/game/sleep' },
      { label: '仮眠（45分）', endpoint: '/game/nap' },
      { label: '休息（15分）', endpoint: '/game/action', body: { actionType: 'REST' } },
    ],
  },
  {
    label: '🍽️ 料理',
    actions: [
      { label: 'パンを作る（30分）', endpoint: '/game/cook', body: { recipeType: 'BREAD' } },
      { label: 'シチューを作る（30分）', endpoint: '/game/cook', body: { recipeType: 'STEW' } },
      { label: '薬草茶を作る（30分）', endpoint: '/game/cook', body: { recipeType: 'HERBAL_TEA' } },
    ],
  },
  {
    label: '🙏 その他',
    actions: [
      { label: '神殿に参拝（15分）', endpoint: '/game/pray', body: { deityType: 'HARVEST' } },
      { label: '治療を受ける（1時間）', endpoint: '/game/treat' },
    ],
  },
]

export default function ActionPanel({ isBusy, onActionStart }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [monsters, setMonsters] = useState<{ id: string; name: string; basePower: number; minCount: number; maxCount: number; elements: string[] }[]>([])
  const [selectedMonster, setSelectedMonster] = useState('')
  const [selectedCrop, setSelectedCrop] = useState('POTATO')
  const [dungeonFloor, setDungeonFloor] = useState(1)

  useEffect(() => {
    api.get<{ success: boolean; monsters?: any[] }>('/game/monsters').then(res => {
      if (res.success && res.monsters) {
        setMonsters(res.monsters)
        if (res.monsters.length > 0) setSelectedMonster(res.monsters[0].id)
      }
    })
  }, [])

  const handleAction = async (endpoint: string, body?: Record<string, unknown>, confirm?: string) => {
    if (isBusy) { 
      SoundManager.playError()
      setMessage('現在別の行動を実行中です。完了するまでお待ちください。')
      return 
    }
    
    if (confirm) {
      SoundManager.playClick() // 確認ダイアログが出る前に鳴らす
      if (!window.confirm(confirm)) return
    }

    setLoading(true)
    setMessage('')
    try {
      const res = await api.post<{ success: boolean; message?: string; completionTime?: string }>(endpoint, body ?? {})
      if (res.success) {
        SoundManager.playSuccess()
        const time = res.completionTime ? new Date(res.completionTime).toLocaleTimeString('ja-JP') : ''
        setMessage(`行動を開始しました。${time ? `完了予定: ${time}` : ''}`)
        onActionStart()
      } else {
        SoundManager.playError()
        setMessage(res.message ?? '行動に失敗しました。')
      }
    } catch {
      SoundManager.playError()
      setMessage('接続エラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleFight = () => {
    const m = monsters.find(x => x.id === selectedMonster)
    if (!m) return
    handleAction('/game/combat', { monsterType: selectedMonster }, `【難易度: ${m.basePower}】${m.name}に挑みます。よろしいですか？\n※敗北すると全てを失う可能性があります。`)
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('失敗') || message.includes('エラー') || message.includes('実行中') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      {isBusy && (
        <div className="bg-stone-800 border border-amber-700 rounded p-3 text-amber-400 text-sm">
          ⏳ 行動中です。完了するまで新しい行動は選択できません。
        </div>
      )}

      {/* 魔物討伐セクション */}
      <div className="bg-stone-900 border border-red-900/50 rounded-lg p-4">
        <h3 className="text-red-400 font-bold mb-3">⚔️ 魔物討伐</h3>
        <p className="text-xs text-stone-400 mb-3">
          滞在中の「国・地域（地形）」に出現する魔物のみ表示されています。<br/>
          魔物は戦闘時にランダムな属性を帯びます。
        </p>
        <div className="flex gap-2">
          <select
            className="flex-1 bg-stone-950 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200"
            value={selectedMonster}
            onChange={(e) => setSelectedMonster(e.target.value)}
            disabled={isBusy || loading || monsters.length === 0}
          >
            {monsters.map(m => {
              const elementNames: Record<string, string> = { FIRE: '炎', WATER: '水', WIND: '風', EARTH: '土', THUNDER: '雷', ICE: '氷', LIGHT: '光', DARK: '闇', POISON: '毒' }
              const els = m.elements.map(e => elementNames[e] || '').join('/')
              const display = `${m.name} (難度: ${m.basePower}) [${els}] ${m.maxCount > 1 ? `${m.minCount}〜${m.maxCount}体` : ''}`
              return (
                <option key={m.id} value={m.id}>
                  {display}
                </option>
              )
            })}
          </select>
          <button
            onClick={() => {
              SoundManager.playAttack()
              handleFight()
            }}
            disabled={isBusy || loading || !selectedMonster}
            className="bg-red-900 hover:bg-red-800 text-red-100 px-4 py-2 rounded font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            討伐へ向かう
          </button>
        </div>
      </div>

      {/* 農業セクション */}
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h3 className="text-stone-300 font-medium mb-3">🌾 農業</h3>
        <div className="mb-3">
          <label className="text-stone-500 text-xs">作物を選択：</label>
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            disabled={isBusy || loading}
            className="ml-2 bg-stone-950 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200"
          >
            <option value="POTATO">ジャガイモ</option>
            <option value="WHEAT">小麦</option>
            <option value="CARROT">ニンジン</option>
            <option value="CABBAGE">キャベツ</option>
            <option value="HERB">薬草</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => handleAction('/game/farm/plow')} disabled={isBusy || loading} className="text-left px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm text-stone-300 transition-colors">畑を耕す（1時間）</button>
          <button onClick={() => handleAction('/game/farm/sow', { cropType: selectedCrop })} disabled={isBusy || loading} className="text-left px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm text-stone-300 transition-colors">種をまく（30分）</button>
          <button onClick={() => handleAction('/game/farm/water')} disabled={isBusy || loading} className="text-left px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm text-stone-300 transition-colors">水やり（15分）</button>
          <button onClick={() => handleAction('/game/farm/harvest')} disabled={isBusy || loading} className="text-left px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm text-stone-300 transition-colors">収穫（30分）</button>
        </div>
      </div>

      {/* ダンジョン探索セクション */}
      <div className="bg-stone-900 border border-purple-900/50 rounded-lg p-4">
        <h3 className="text-purple-400 font-bold mb-3">🏰 ダンジョン探索</h3>
        <p className="text-xs text-stone-400 mb-3">
          深層ほど敵が強力になりますが、宝箱から良いクリスタルが手に入る確率が上がります。<br/>
          （3連戦のオートバトルが行われます。HPに注意してください）
        </p>
        <div className="flex gap-2">
          <select
            value={dungeonFloor}
            onChange={e => setDungeonFloor(Number(e.target.value))}
            disabled={isBusy || loading}
            className="flex-1 bg-stone-950 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200"
          >
            {[1, 2, 3, 4, 5].map(f => (
              <option key={f} value={f}>第{f}層（推奨レベル: {f * 5}〜）</option>
            ))}
          </select>
          <button
            onClick={() => handleAction('/game/dungeon', { floor: dungeonFloor }, `第${dungeonFloor}層に潜ります。強力な敵が出現する可能性があります。本当に行きますか？`)}
            disabled={isBusy || loading}
            className="bg-purple-900 hover:bg-purple-800 text-purple-100 px-4 py-2 rounded font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            探索へ向かう（30分）
          </button>
        </div>
      </div>

      {ACTION_GROUPS.map(group => (
        <div key={group.label} className="bg-stone-900 border border-stone-700 rounded-lg p-4">
          <h3 className="text-stone-300 font-medium mb-3">{group.label}</h3>
          <div className="grid grid-cols-2 gap-2">
            {group.actions.map(action => (
              <button
                key={action.label}
                onClick={() => handleAction(action.endpoint, action.body, action.confirm)}
                disabled={isBusy || loading}
                className="text-left px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm text-stone-300 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
