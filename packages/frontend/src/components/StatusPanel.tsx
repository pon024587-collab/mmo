import { useState } from 'react'
import { api } from '../api/client.js'

interface CharacterStatus {
  name: string
  age: number
  healthText: string
  hungerText: string
  thirstText: string
  fatigueText: string
  stressText: string
  gold: number
  villageName: string
  nationName: string
  taxDebt: number
  skills?: { category: string; exp: number; rank: string }[]
}

interface Props { 
  character: CharacterStatus
  onRefresh: () => void
}

export default function StatusPanel({ character, onRefresh }: Props) {
  const [nameInput, setNameInput] = useState('')
  const [nameEditing, setNameEditing] = useState(false)

  const handleRepay = async () => {
    const res = await api.post<{ success: boolean; message?: string }>('/game/tax/repay', { amount: character.taxDebt })
    setMessage(res.message ?? '')
    if (res.success) onRefresh()
  }

  const handleRename = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed || trimmed.length < 1 || trimmed.length > 20) {
      setMessage('名前は1〜20文字で入力してください。')
      return
    }
    const res = await api.post<{ success: boolean; message?: string }>('/game/character/rename', { name: trimmed })
    setMessage(res.message ?? '')
    if (res.success) { setNameEditing(false); setNameInput(''); onRefresh() }
  }


  const SKILL_LABELS: Record<string, string> = {
    'MAGIC_FIRE': '炎魔法', 'MAGIC_WATER': '水魔法', 'MAGIC_WIND': '風魔法',
    'MAGIC_EARTH': '土魔法', 'MAGIC_THUNDER': '雷魔法', 'MAGIC_ICE': '氷魔法',
    'MAGIC_LIGHT': '光魔法', 'MAGIC_DARK': '闇魔法', 'MAGIC_TIME': '時空魔法', 'MAGIC_LIFE': '生命魔法',
    'WEAPON_SWORD': '剣技', 'WEAPON_SPEAR': '槍技', 'WEAPON_AXE': '斧技',
    'WEAPON_BOW': '弓技', 'WEAPON_DAGGER': '短剣技', 'WEAPON_BLUNT': '打撃技',
    'WEAPON_STAFF': '杖技', 'WEAPON_UNARMED': '体術'
  }

  return (
    <div className="space-y-4">
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold text-lg mb-3">キャラクター状態</h2>
        {message && (
          <div className={`mb-3 p-2 rounded text-sm ${message.includes('失敗') || message.includes('足りません') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
            {message}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2 flex items-center gap-2 border border-stone-800 p-2 rounded bg-stone-950">
            <span className="text-stone-500 shrink-0">名前: </span>
            {nameEditing ? (
              <>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                  maxLength={20}
                  placeholder={character.name}
                  className="flex-1 bg-stone-800 border border-stone-600 rounded px-2 py-0.5 text-sm text-white"
                  autoFocus
                />
                <button onClick={handleRename} className="px-2 py-0.5 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded">確定</button>
                <button onClick={() => setNameEditing(false)} className="px-2 py-0.5 bg-stone-700 hover:bg-stone-600 text-white text-xs rounded">取消</button>
              </>
            ) : (
              <>
                <span className="text-stone-200 flex-1">{character.name}</span>
                <button onClick={() => { setNameEditing(true); setNameInput(character.name) }} className="px-2 py-0.5 bg-stone-700 hover:bg-stone-600 text-white text-xs rounded">変更</button>
              </>
            )}
          </div>
          <StatusRow label="年齢" value={`${character.age}歳`} />
          <StatusRow label="所持金" value={`${character.gold}G`} />
          <StatusRow label="国家" value={character.nationName} />
          <StatusRow label="村" value={character.villageName} />
          
          <div className="col-span-2 flex items-center justify-between border border-stone-800 p-2 rounded bg-stone-950">
            <div>
              <span className="text-stone-500">未納税額: </span>
              <span className={character.taxDebt > 0 ? 'text-red-400' : 'text-stone-200'}>{character.taxDebt}G</span>
            </div>
            {character.taxDebt > 0 && (
              <button 
                onClick={handleRepay}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded"
              >
                納税する
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold mb-3">身体状態</h2>
        <div className="space-y-2 text-sm">
          <ConditionRow label="体力" text={character.healthText} />
          <ConditionRow label="空腹" text={character.hungerText} />
          <ConditionRow label="水分" text={character.thirstText} />
          <ConditionRow label="疲労" text={character.fatigueText} />
          <ConditionRow label="精神" text={character.stressText} />
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold mb-3">習得スキル</h2>
        {(!character.skills || character.skills.length === 0) ? (
          <p className="text-stone-500 text-sm">まだ習得しているスキルはありません。</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {character.skills.map(s => (
              <div key={s.category} className="border border-stone-800 p-2 rounded bg-stone-950 flex justify-between items-center">
                <span className="text-stone-300 font-bold">{SKILL_LABELS[s.category] || s.category}</span>
                <span className="text-amber-400">{s.rank}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-stone-500">{label}: </span>
      <span className="text-stone-200">{value}</span>
    </div>
  )
}

function ConditionRow({ label, text }: { label: string; text: string }) {
  const isWarning = text.includes('限界') || text.includes('瀕死') || text.includes('脱水')
  return (
    <div className="flex justify-between">
      <span className="text-stone-500 w-12">{label}</span>
      <span className={isWarning ? 'text-red-400' : 'text-stone-300'}>{text}</span>
    </div>
  )
}
