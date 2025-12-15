import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Plus, Trash2 } from 'lucide-react'

export default function AdminPasses() {
    const { api } = useAuth()
    const [types, setTypes] = useState([])
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', durationDays: 365, type: 'unlimited', credits: 0
    })

    useEffect(() => { loadTypes() }, [])

    async function loadTypes() {
        try {
            const res = await api.get('/api/passes/types')
            setTypes(res.data)
        } catch (e) { console.error(e) }
    }

    async function createType(e) {
        e.preventDefault()
        try {
            await api.post('/api/passes/types', formData)
            setIsCreating(false)
            loadTypes()
            setFormData({ name: '', description: '', price: '', durationDays: 365, type: 'unlimited', credits: 0 })
        } catch (e) { alert('Error creating pass type') }
    }

    async function deleteType(id) {
        if (!confirm('Are you sure you want to delete this pass type?')) return
        try {
            await api.delete(`/api/passes/types/${id}`)
            loadTypes()
        } catch (e) { alert('Error deleting') }
    }

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Season Passes</h2>
                <button onClick={() => setIsCreating(!isCreating)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> New Pass Type
                </button>
            </div>

            {isCreating && (
                <form onSubmit={createType} className="mb-8 bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Pass Name" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input placeholder="Price ($)" type="number" className="input-field" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                        <input placeholder="Description" className="input-field col-span-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

                        <select className="input-field" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            <option value="unlimited">Unlimited</option>
                            <option value="credits">Credits</option>
                        </select>
                        <input placeholder="Duration (Days)" type="number" className="input-field" value={formData.durationDays} onChange={e => setFormData({ ...formData, durationDays: e.target.value })} required />

                        {formData.type === 'credits' && (
                            <input placeholder="Credits Amount" type="number" className="input-field" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} required />
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Create Pass</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {types.map(t => (
                    <div key={t._id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white">{t.name}</h3>
                            <p className="text-sm text-gray-400">{t.description}</p>
                            <div className="flex gap-2 mt-2 text-xs">
                                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">${t.price}</span>
                                <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">{t.type}</span>
                                {t.type === 'credits' && <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">{t.credits} Credits</span>}
                            </div>
                        </div>
                        <button
                            onClick={() => deleteType(t._id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors"
                            title="Delete Pass"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
