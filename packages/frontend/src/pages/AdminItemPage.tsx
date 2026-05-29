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

interface CustomItem { id: string; name: string; category: string; basePrice: number; attackPower: number; defensePower: number; magicPower: number }

const CATEGORIES = ['WEAPON','ARMOR','MATERIAL','CONSUMABLE','MAGIC_TOOL','BOOK','CROP']

export default function AdminItemPage({ secret }: { secret: string }) {
  const [items, setItems] = useState<CustomItem[]>([])
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '', category: 'WEAPON', basePrice: 100, itemWeight: 1,
    attackPower: 0, defensePower: 0, magicPower: 0,
    requiredStrength: 0, requiredDexterity: 0, description: '',
  })

  const load = async () => {
    const r = await adminFetch<{ success: boolean; items?: CustomItem[] }>('/admin/items/custom', 'GET', undefined, secret)
    if (r.success) setItems(r.items ?? [])
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    const res = await adminFetch<{ success: boolean; message?: string }>('/admin/items/custom', 'POST', form, secret)
    setMessage(res.message ?? '')
    if (res.success) { load(); setForm({ name: '', category: 'WEAPON', basePrice: 100, itemWeight: 1, attackPower: 0, defensePower: 0, magicPower: 0, requiredStrength: 0, requiredDexterity: 0, description: '' }) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('削除しますか？')) return
    await adminFetch('/admin/items/custom/' + id, 'DELETE', undefined, secret)
    load()
  }

  return (
    <div className="space-y-4">
      {message && <div className="bg-green-900 text-green-300 p-3 rounded text-sm">{message}</div>}

      <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3">
        <h3 className="text-amber-400 font-bold">⚔️ カスタムアイテムを作成</h3>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-stone-500 text-xs">名前</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">カテゴリ</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="text-stone-500 text-xs">基本価格(G)</label><input type="number" value={form.basePrice} onChange={e => setForm(f => ({...f, basePrice: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">重さ</label><input type="number" value={form.itemWeight} onChange={e => setForm(f => ({...f, itemWeight: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">攻撃力</label><input type="number" value={form.attackPower} onChange={e => setForm(f => ({...f, attackPower: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">防御力</label><input type="number" value={form.defensePower} onChange={e => setForm(f => ({...f, defensePower: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">魔法力</label><input type="number" value={form.magicPower} onChange={e => setForm(f => ({...f, magicPower: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">必要筋力</label><input type="number" value={form.requiredStrength} onChange={e => setForm(f => ({...f, requiredStrength: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
          <div><label className="text-stone-500 text-xs">必要器用さ</label><input type="number" value={form.requiredDexterity} onChange={e => setForm(f => ({...f, requiredDexterity: parseInt(e.target.value)}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
        </div>
        <div><label className="text-stone-500 text-xs">説明</label><input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full bg-stone-800 border border-stone-600 rounded px-2 py-1 text-stone-200 text-sm" /></div>
        <button onClick={handleCreate} className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded">作成する</button>
      </div>

      <div className="space-y-2">
        <h3 className="text-stone-300 font-medium">作成済みカスタムアイテム</h3>
        {items.length === 0 && <p className="text-stone-600 text-sm">まだありません。</p>}
        {items.map(i => (
          <div key={i.id} className="bg-stone-900 border border-stone-700 rounded p-3 flex justify-between items-center">
            <div>
              <span className="text-stone-200 text-sm font-medium">{i.name}</span>
              <span className="text-stone-500 text-xs ml-2">{i.category}</span>
              <div className="flex gap-2 text-xs mt-0.5">
                {i.attackPower > 0 && <span className="text-red-400">ATK+{i.attackPower}</span>}
                {i.defensePower > 0 && <span className="text-blue-400">DEF+{i.defensePower}</span>}
                {i.magicPower > 0 && <span className="text-purple-400">MAG+{i.magicPower}</span>}
                <span className="text-amber-400">{i.basePrice}G</span>
              </div>
            </div>
            <button onClick={() => handleDelete(i.id)} className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">削除</button>
          </div>
        ))}
      </div>
    </div>
  )
}
