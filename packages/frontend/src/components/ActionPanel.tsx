import { useState } from 'react'
import { api } from '../api/client.js'

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
    label: '🌾 農業',
    actions: [
      { label: '畑を耕す（2時間）', endpoint: '/game/farm/plow' },
      { label: '種をまく（1時間）', endpoint: '/game/farm/sow', body: { cropType: 'POTATO' } },
      { label: '水やり（30分）', endpoint: '/game/farm/water' },
      { label: '収穫（1時間）', endpoint: '/game/farm/harvest' },
    ],
  },
  {
    label: '⚔️ 戦闘',
    actions: [
      { label: '素振り（30分）', endpoint: '/game/action', body: { actionType: 'COMBAT_PRACTICE' } },
      { label: 'ゴブリンと戦う', endpoint: '/game/combat', body: { monsterType: 'GOBLIN' }, confirm: '戦闘は危険です。本当に挑みますか？' },
      { label: 'オークと戦う', endpoint: '/game/combat', body: { monsterType: 'ORC' }, confirm: '強敵です。本当に挑みますか？' },
      { label: '狼と戦う', endpoint: '/game/combat', body: { monsterType: 'WOLF' }, confirm: '戦闘は危険です。本当に挑みますか？' },
      { label: 'アンデッドと戦う', endpoint: '/game/combat', body: { monsterType: 'UNDEAD' }, confirm: '戦闘は危険です。本当に挑みますか？' },
    ],
  },
  {
    label: '🦹 犯罪行為',
    actions: [
      { label: 'NPCから盗む', endpoint: '/game/action', body: { actionType: 'STEAL_NPC' }, confirm: '⚠️ 犯罪行為です。賞金首になります。本当に実行しますか？' },
      { label: '道中に潜む（盗賊）', endpoint: '/pvp/ambush', body: { routeVillageA: '', routeVillageB: '', maxAttacks: 3 }, confirm: '⚠️ 犯罪行為です。賞金首になります。本当に実行しますか？' },
    ],
  },
  {
    label: '🪨 採集',
    actions: [
      { label: '採掘（2時間）', endpoint: '/game/gather', body: { gatherType: 'MINE' } },
      { label: '木を切る（1.5時間）', endpoint: '/game/gather', body: { gatherType: 'CHOP_WOOD' } },
      { label: '薬草を摘む（1時間）', endpoint: '/game/gather', body: { gatherType: 'GATHER_HERBS' } },
      { label: '釣り（1.5時間）', endpoint: '/game/gather', body: { gatherType: 'FISH' } },
    ],
  },
  {
    label: '🍞 生存',
    actions: [
      { label: '水を飲む（5分）', endpoint: '/game/drink' },
      { label: '睡眠（7時間）', endpoint: '/game/sleep' },
      { label: '仮眠（1.5時間）', endpoint: '/game/nap' },
      { label: '休息（30分）', endpoint: '/game/action', body: { actionType: 'REST' } },
    ],
  },
  {
    label: '🙏 その他',
    actions: [
      { label: '神殿に参拝（30分）', endpoint: '/game/pray', body: { deityType: 'HARVEST' } },
      { label: '治療を受ける（2時間）', endpoint: '/game/treat' },
    ],
  },
]

export default function ActionPanel({ isBusy, onActionStart }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAction = async (endpoint: string, body?: Record<string, unknown>, confirm?: string) => {
    if (isBusy) { setMessage('現在別の行動を実行中です。完了するまでお待ちください。'); return }
    if (confirm && !window.confirm(confirm)) return

    setLoading(true)
    setMessage('')
    try {
      const res = await api.post<{ success: boolean; message?: string; completionTime?: string }>(endpoint, body ?? {})
      if (res.success) {
        const time = res.completionTime ? new Date(res.completionTime).toLocaleTimeString('ja-JP') : ''
        setMessage(`行動を開始しました。${time ? `完了予定: ${time}` : ''}`)
        onActionStart()
      } else {
        setMessage(res.message ?? '行動に失敗しました。')
      }
    } catch {
      setMessage('接続エラーが発生しました。')
    } finally {
      setLoading(false)
    }
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
