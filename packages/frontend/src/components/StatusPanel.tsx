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
}

interface Props { character: CharacterStatus }

export default function StatusPanel({ character }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4">
        <h2 className="text-amber-400 font-bold text-lg mb-3">キャラクター状態</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatusRow label="名前" value={character.name} />
          <StatusRow label="年齢" value={`${character.age}歳`} />
          <StatusRow label="所持金" value={`${character.gold}G`} />
          <StatusRow label="国家" value={character.nationName} />
          <StatusRow label="村" value={character.villageName} />
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
