interface Result {
  actionType: string
  resultText: string
  completedAt: string
}

interface Props { results: Result[] }

export default function ResultLog({ results }: Props) {
  if (results.length === 0) {
    return <p className="text-stone-600 text-sm text-center py-8">まだ記録がありません。行動を選択してください。</p>
  }

  return (
    <div className="space-y-2">
      {results.map((r, i) => (
        <div key={i} className="bg-stone-900 border border-stone-800 rounded p-3">
          <div className="flex justify-between items-start mb-1">
            <span className="text-stone-500 text-xs">{r.actionType}</span>
            <span className="text-stone-600 text-xs">{new Date(r.completedAt).toLocaleString('ja-JP')}</span>
          </div>
          <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">{r.resultText}</p>
        </div>
      ))}
    </div>
  )
}
