import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../hooks/useAuth.js'
import StatusPanel from '../components/StatusPanel.js'
import ActionPanel from '../components/ActionPanel.js'
import { SoundManager } from '../utils/sound.js'
import ResultLog from '../components/ResultLog.js'
import VillagePanel from '../components/VillagePanel.js'
import MarketPanel from '../components/MarketPanel.js'
import InventoryPanel from '../components/InventoryPanel.js'
import LifeRecordPanel from '../components/LifeRecordPanel.js'
import WorldMapPanel from '../components/WorldMapPanel.js'
import NpcPanel from '../components/NpcPanel.js'
import QuestPanel from '../components/QuestPanel.js'
import PvpPanel from '../components/PvpPanel.js'
import CraftingPanel from '../components/CraftingPanel.js'
import PlayerMarketPanel from '../components/PlayerMarketPanel.js'
import ChatPanel from '../components/ChatPanel.js'
import MagicPanel from '../components/MagicPanel.js'
import StoragePanel from '../components/StoragePanel.js'

interface CharacterStatus {
  name: string
  age: number
  healthText: string
  hungerText: string
  thirstText: string
  fatigueText: string
  stressText: string
  villageName: string
  nationName: string
  gold: number
  taxDebt: number
  status: string
  currentAction: string | null
  actionCompletesAt: string | null
  skills?: { category: string; exp: number; rank: string }[]
}

interface Result {
  actionType: string
  resultText: string
  completedAt: string
}

type Tab = 'status' | 'action' | 'village' | 'map' | 'npc' | 'quest' | 'market' | 'playerMarket' | 'storage' | 'inventory' | 'craft' | 'magic' | 'pvp' | 'chat' | 'log' | 'records'

const TAB_LABELS: Record<Tab, string> = {
  status:  '状態',
  action:  '行動',
  village: '村',
  map:     '地図',
  npc:     '村人',
  quest:   'クエスト',
  market:  'NPC市場',
  playerMarket: '露店',
  storage:      '倉庫',
  inventory: '所持品',
  craft:     'クラフト',
  magic:     '魔法',
  pvp:     'PvP',
  chat:    'チャット',
  log:     '記録',
  records: '人生',
}

export default function GamePage() {
  const [character, setCharacter] = useState<CharacterStatus | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [guardCheck, setGuardCheck] = useState<{ pending: boolean; bountyAmount: number } | null>(null)
  const [guardMessage, setGuardMessage] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('status')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const fetchCharacter = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; character?: CharacterStatus }>('/game/character')
      if (res.success && res.character) setCharacter(res.character)
    } catch {
      setError('接続エラー。再試行してください。')
    }
  }, [])

  const fetchResults = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; results?: Result[] }>('/game/results')
      if (res.success && res.results && res.results.length > 0) {
        setResults(prev => [...res.results!, ...prev].slice(0, 50))
      }
    } catch {}
  }, [])

  const checkGuard = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; pending?: boolean; bountyAmount?: number }>('/pvp/guard/status')
      if (res.success && res.pending) {
        setGuardCheck({ pending: res.pending, bountyAmount: res.bountyAmount ?? 0 })
      }
    } catch {}
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchCharacter()
      await fetchResults()
      await checkGuard()
      setLoading(false)
    }
    init()
    const interval = setInterval(() => { fetchCharacter(); fetchResults(); checkGuard() }, 30000)
    return () => clearInterval(interval)
  }, [fetchCharacter, fetchResults, checkGuard])

  const handleGuardAction = async (action: 'fight' | 'flee' | 'surrender') => {
    const res = await api.post<{ success?: boolean; victory?: boolean; resultText?: string; text?: string; message?: string }>(
      `/pvp/guard/${action}`, {}
    )
    setGuardMessage(res.resultText ?? res.text ?? res.message ?? '処理しました。')
    setGuardCheck(null)
    fetchCharacter()
  }

  const handleLogout = () => { logout(); navigate('/login') }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <p className="text-amber-400 animate-pulse">世界に接続中...</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center space-y-4">
          <p className="text-stone-400">キャラクターが見つかりません。</p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={() => { navigate('/death') }} className="block w-full py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-bold">
            ✨ 新しい人生を始める
          </button>
          <button onClick={() => { fetchCharacter(); setError('') }} className="text-amber-400 hover:underline text-sm">再試行</button>
          <br />
          <button onClick={handleLogout} className="text-stone-500 hover:text-stone-300 text-sm">ログアウト</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* 衛兵強制モーダル */}
      {guardCheck && guardCheck.pending && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-red-950 border border-red-700 p-6 rounded-lg max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-red-400 mb-4 text-center animate-pulse">⚠️ 衛兵に遭遇した！</h2>
            <p className="text-stone-300 text-sm mb-4">
              あなたは賞金首（{guardCheck.bountyAmount}G）として指名手配されています。衛兵が立ちはだかりました。
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleGuardAction('fight')} className="py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded">⚔️ 強行突破する</button>
              <button onClick={() => handleGuardAction('flee')} className="py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded">🏃 逃げ出す</button>
              <button onClick={() => handleGuardAction('surrender')} className="py-3 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded">🏳️ 大人しく自首する</button>
            </div>
          </div>
        </div>
      )}

      {/* 衛兵事後メッセージモーダル */}
      {guardMessage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-600 p-6 rounded-lg max-w-sm w-full shadow-xl text-center">
            <p className="text-stone-300 mb-6">{guardMessage}</p>
            <button onClick={() => setGuardMessage('')} className="px-6 py-2 bg-stone-700 hover:bg-stone-600 rounded text-stone-100 font-bold">閉じる</button>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="border-b border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-stone-950 z-10">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold">⚔️ {character.name}</span>
          <span className="text-stone-500 text-xs hidden sm:inline">{character.nationName} / {character.villageName}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-300 text-sm font-mono">💰 {character.gold}G</span>
          <button onClick={() => navigate('/admin')} className="text-stone-600 hover:text-stone-400 text-xs">管理画面</button>
          <button onClick={handleLogout} className="text-stone-600 hover:text-stone-400 text-xs">ログアウト</button>
        </div>
      </header>

      {/* 投獄バナー */}
      {character.status === 'IMPRISONED' && (
        <div className="bg-red-900 border-b border-red-700 px-4 py-2 text-sm text-red-100 flex items-center justify-center font-bold">
          ⛓️ 牢獄に捕まっています ⛓️
        </div>
      )}

      {/* 現在の行動バナー */}
      {character.currentAction && (
        <div className="bg-stone-900 border-b border-amber-900 px-4 py-2 text-xs text-amber-400 flex justify-between">
          <span>⏳ {character.currentAction} 実行中</span>
          {character.actionCompletesAt && (
            <span className="text-stone-500">
              完了: {new Date(character.actionCompletesAt).toLocaleTimeString('ja-JP')}
            </span>
          )}
        </div>
      )}

      {/* 新着結果バナー */}
      {results.length > 0 && results[0] && (
        <div className="bg-stone-900 border-b border-stone-700 px-4 py-2 text-xs text-stone-400 cursor-pointer hover:bg-stone-800" onClick={() => { SoundManager.playClick(); setActiveTab('log') }}>
          📜 {results[0].resultText.slice(0, 60)}{results[0].resultText.length > 60 ? '…' : ''}
        </div>
      )}

      {/* タブナビ */}
      <nav className="flex border-b border-stone-800 bg-stone-950 sticky top-[49px] z-10 overflow-x-auto">
        {(Object.keys(TAB_LABELS) as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              SoundManager.playClick()
              setActiveTab(tab)
            }}
            className={`flex-1 min-w-[60px] py-3 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-amber-400 border-b-2 border-amber-400 bg-stone-900'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      {/* コンテンツ */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {activeTab === 'status'  && <StatusPanel character={character} onRefresh={fetchCharacter} />}
        {activeTab === 'action'  && (
          <ActionPanel
            characterId=""
            isBusy={!!character.currentAction}
            onActionStart={() => { fetchCharacter(); fetchResults() }}
          />
        )}
        {activeTab === 'village' && <VillagePanel />}
        {activeTab === 'map'     && (
          <WorldMapPanel
            isBusy={!!character.currentAction}
            onMove={() => { fetchCharacter(); fetchResults() }}
          />
        )}
        {activeTab === 'npc'     && <NpcPanel />}
        {activeTab === 'quest'   && <QuestPanel />}
        {activeTab === 'market'  && <MarketPanel />}
        {activeTab === 'playerMarket' && <PlayerMarketPanel />}
        {activeTab === 'storage'      && <StoragePanel />}
        {activeTab === 'inventory' && <InventoryPanel />}
        {activeTab === 'craft'     && <CraftingPanel />}
        {activeTab === 'magic'     && <MagicPanel />}
        {activeTab === 'pvp'     && <PvpPanel />}
        {activeTab === 'chat'    && <ChatPanel />}
        {activeTab === 'log'     && <ResultLog results={results} />}
        {activeTab === 'records' && <LifeRecordPanel />}
      </main>

      {/* エラー表示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900 text-red-300 text-sm px-4 py-2 rounded shadow-lg flex items-center gap-3">
          {error}
          <button onClick={() => { fetchCharacter(); setError('') }} className="underline">再試行</button>
        </div>
      )}
    </div>
  )
}
