import { useState, useEffect } from 'react'

const API_BASE = (import.meta.env['VITE_API_URL'] as string | undefined)
  ? `${import.meta.env['VITE_API_URL']}/api`
  : '/api'

async function adminFetch<T>(path: string, method = 'GET', body?: unknown, secret = ''): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<T>
}

const ELEMENTS = ['FIRE','WATER','WIND','EARTH','THUNDER','ICE','LIGHT','DARK','POISON']
const TERRAINS = ['PLAIN','FOREST','MOUNTAIN','RIVER','DESERT','SNOWFIELD']

interface CustomMonster {
  id: string; name: string; basePower: number; minCount: number; maxCount: number
  elements: string[]; terrains: string[]; dropMaterials: string[]; dropItems: string[]
  spawnVillageId: string | null; spawnStartHour: number | null; spawnEndHour: number | null
  isActive: boolean
}

interface Village { id: string; name: string }

export default function AdminMonsterPage({ secret }: { secret: string }) {
  const [monsters, setMonsters] = useState<CustomMonster[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '', basePower: 10, minCount: 1, maxCount: 1,
    elements: [] as string[], terrains: ['PLAIN'] as string[],
    dropMaterials: '', dropItems: '',
    spawnVillageId: '', spawnStartHour: '', spawnEndHour: '',
  })

  const load = async () => {
    const r = await adminFetch<{ success: boolean; monsters?: CustomMonster[] }>('/admin/monsters/custom', 'GET', undefined, secret)
    if (r.success) setMonsters(r.monsters ?? [])
    const v = await adminFetch<{ success: boolean; villages?: Village[] }>('/admin/characters', 'GET', undefined, secret)
    // 村一覧はcharactersから取れないので別途取得
    const vr = await fetch(`${API_BASE}/game/world`, { headers: { 'x-admin-secret': secret } })
    const vd = await vr.json() as { success: boolean; villages?: Village[] }
    if (vd.success) setVillages(vd.villages ?? [])
  }

  useEffect(() => { load() }, [])

  const toggleElement = (el: string) => {
    setForm(f => ({ ...f, elements: f.elements.includes(el) ? f.elements.filter(e => e !== el) : [...f.elements, el] }))
  }
  const toggleTerrain = (t: string) => {
    setForm(f => ({ ...f, terrains: f.terrains.includes(t) ? f.terrains.filter(e => e !== t) : [...f.terrains, t] }))
  }

  const handleCreate = async () => {
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/monsters/custom', 'POST', {
      name: form.name, basePower: form.basePower, minCount: form.minCount, maxCount: form.maxCount,
      elements: form.elements, terrains: form.terrains,
      dropMaterials: form.dropMaterials.split(',').map(s => s.trim()).filter(Boolean),
      dropItems: form.dropItems.split(',').map(s => s.trim()).filter(Boolean),
      spawnVillageId: form.spawnVillageId || undefined,
      spawnStartHour: form.spawnStartHour ? parseInt(form.spawnStartHour) : undefined,
      spawnEndHour: form.spawnEndHour ? parseInt(form.spawnEndHour) : undefined,
    }, secret)
    setMessage(res.message ?? '')
    if (res.success) { load(); setForm({ name: '', basePower: 10, minCount: 1, maxCount: 1, elements: [], terrains: ['PLAIN'], dropMaterials: '', dropItems: '', spawnVillageId: '', spawnStartHour: '', spawnEndHour: '' }) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('削除しますか？')) return
    await adminFetch('/admin/monsters/custom/' + id, 'DELETE', undefined, secret)
    load()
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await adminFetch('/admin/monsters/custom/' + id, 'PATCH', { isActive: !isActive }, secret)
    load()
  }

  return (
    <div className="space-y-4">
      {message && <div className="bg-green-900 text-green-300 p-3 rounded text-sm">{message}</div>}

      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3">
        <h3 className="text-amber-400 font-bold">👹 カスタム魔物を作成</h3>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-stone-500 text-xs">名前</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">基本強さ</label><input type="number" value={form.basePower} onChange={e => setForm(f => ({...f, basePower: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">最小出現数</label><input type="number" min={1} max={20} value={form.minCount} onChange={e => setForm(f => ({...f, minCount: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">最大出現数</label><input type="number" min={1} max={20} value={form.maxCount} onChange={e => setForm(f => ({...f, maxCount: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
        </div>
        <div><label className="text-stone-500 text-xs block mb-1">属性</label><div className="flex flex-wrap gap-1">{ELEMENTS.map(el => <button key={el} onClick={() => toggleElement(el)} className={`px-2 py-0.5 rounded text-xs ${form.elements.includes(el) ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>{el}</button>)}</div></div>
        <div><label className="text-stone-500 text-xs block mb-1">出現地形</label><div className="flex flex-wrap gap-1">{TERRAINS.map(t => <button key={t} onClick={() => toggleTerrain(t)} className={`px-2 py-0.5 rounded text-xs ${form.terrains.includes(t) ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'}`}>{t}</button>)}</div></div>
        <div><label className="text-stone-500 text-xs">ドロップ素材（カンマ区切り）</label><input value={form.dropMaterials} onChange={e => setForm(f => ({...f, dropMaterials: e.target.value}))} placeholder="ゴブリンの耳, 魔石" className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
        <div><label className="text-stone-500 text-xs">ドロップアイテム（カンマ区切り）</label><input value={form.dropItems} onChange={e => setForm(f => ({...f, dropItems: e.target.value}))} placeholder="鉄の剣, 魔法の杖" className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-stone-500 text-xs">出現村</label><select value={form.spawnVillageId} onChange={e => setForm(f => ({...f, spawnVillageId: e.target.value}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm"><option value="">全村</option>{villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
          <div><label className="text-stone-500 text-xs">出現開始時刻(UTC)</label><input type="number" min={0} max={23} value={form.spawnStartHour} onChange={e => setForm(f => ({...f, spawnStartHour: e.target.value}))} placeholder="0〜23" className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">出現終了時刻(UTC)</label><input type="number" min={0} max={23} value={form.spawnEndHour} onChange={e => setForm(f => ({...f, spawnEndHour: e.target.value}))} placeholder="0〜23" className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
        </div>
        <button onClick={handleCreate} className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded">作成する</button>
      </div>

      <div className="space-y-2">
        <h3 className="text-stone-300 font-medium">作成済みカスタム魔物</h3>
        {monsters.length === 0 && <p className="text-stone-600 text-sm">まだありません。</p>}
        {monsters.map(m => (
          <div key={m.id} className={`bg-stone-900 border rounded p-3 ${m.isActive ? 'border-stone-600' : 'border-stone-800 opacity-50'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-stone-200 font-medium">{m.name}</span>
                <span className="text-stone-500 text-xs ml-2">強さ:{m.basePower} 出現:{m.minCount}〜{m.maxCount}体</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(m.id, m.isActive)} className={`px-2 py-1 text-xs rounded ${m.isActive ? 'bg-stone-700 text-stone-300' : 'bg-green-800 text-green-300'}`}>{m.isActive ? '無効化' : '有効化'}</button>
                <button onClick={() => handleDelete(m.id)} className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">削除</button>
              </div>
            </div>
            <div className="text-xs text-stone-500 mt-1">
              地形: {m.terrains.join(',')} | 属性: {m.elements.join(',') || 'なし'}
              {m.spawnStartHour !== null && ` | 時間: ${m.spawnStartHour}〜${m.spawnEndHour}時`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
