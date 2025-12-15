import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function CreateEvent() {
    const { api } = useAuth()
    const nav = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        venue: '',
        date: '',
        bannerUrl: '',
        eventType: 'general', // 'seated' or 'general'
        capacity: '',
        ticketTiers: [{ name: 'General Admission', price: 0, quantity: 100 }]
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function submit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api.post('/api/events', formData)
            nav('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create event')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <h1 className="text-4xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent mb-2 relative z-10">
                    Host an Experience
                </h1>
                <p className="text-gray-400 mb-10 relative z-10">Create a memorable event for your audience.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 animate-fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Event Details</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-dark-bg/60 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 focus:bg-dark-bg/80 transition-all text-white placeholder-gray-600 text-lg font-medium"
                                    placeholder="Event Name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Cover Image</label>
                                <input
                                    value={formData.bannerUrl}
                                    onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })}
                                    className="w-full bg-dark-bg/60 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 focus:bg-dark-bg/80 transition-all text-white placeholder-gray-600"
                                    placeholder="Banner Image URL (https://...)"
                                />
                                {formData.bannerUrl && (
                                    <div className="mt-4 h-40 w-full rounded-xl overflow-hidden border border-white/10 bg-dark-bg">
                                        <img src={formData.bannerUrl} alt="Preview" className="w-full h-full object-cover opacity-80" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Venue</label>
                                    <input
                                        value={formData.venue}
                                        onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                        className="w-full bg-dark-bg/60 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 focus:bg-dark-bg/80 transition-all text-white placeholder-gray-600"
                                        placeholder="Location"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-dark-bg/60 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 focus:bg-dark-bg/80 transition-all text-white [color-scheme:dark]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-dark-bg/60 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 focus:bg-dark-bg/80 transition-all text-white placeholder-gray-600 h-[140px] resize-none"
                                    placeholder="Tell people what your event is about..."
                                    required
                                />
                            </div>

                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Ticketing & Capacity</label>

                                <div className="flex gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, eventType: 'general' })}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition-all font-medium ${formData.eventType === 'general'
                                            ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20'
                                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        Ticket Selling
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, eventType: 'seated' })}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition-all font-medium ${formData.eventType === 'seated'
                                            ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20'
                                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        Seated Event
                                    </button>
                                </div>

                                {formData.eventType === 'general' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-white">Ticket Types</label>
                                            <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded">
                                                Total Capacity: {formData.ticketTiers?.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0) || 0}
                                            </span>
                                        </div>

                                        {(formData.ticketTiers || []).map((tier, idx) => (
                                            <div key={idx} className="flex gap-3 items-center bg-black/20 p-3 rounded-xl border border-white/5">
                                                <input
                                                    placeholder="Tier Name (e.g. VIP)"
                                                    value={tier.name}
                                                    onChange={e => {
                                                        const newTiers = [...(formData.ticketTiers || [])]
                                                        newTiers[idx].name = e.target.value
                                                        setFormData({ ...formData, ticketTiers: newTiers })
                                                    }}
                                                    className="flex-[2] bg-transparent border-none focus:outline-none text-white text-sm px-2"
                                                />
                                                <div className="w-px h-6 bg-white/10"></div>
                                                <input
                                                    type="number"
                                                    placeholder="Price ($)"
                                                    value={tier.price}
                                                    onChange={e => {
                                                        const newTiers = [...(formData.ticketTiers || [])]
                                                        newTiers[idx].price = parseInt(e.target.value) || 0
                                                        setFormData({ ...formData, ticketTiers: newTiers })
                                                    }}
                                                    className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm px-2 text-center"
                                                />
                                                <div className="w-px h-6 bg-white/10"></div>
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={tier.quantity}
                                                    onChange={e => {
                                                        const newTiers = [...(formData.ticketTiers || [])]
                                                        newTiers[idx].quantity = parseInt(e.target.value) || 0
                                                        setFormData({ ...formData, ticketTiers: newTiers })
                                                    }}
                                                    className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm px-2 text-center"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newTiers = formData.ticketTiers.filter((_, i) => i !== idx)
                                                        setFormData({ ...formData, ticketTiers: newTiers })
                                                    }}
                                                    className="p-2 text-red-400 hover:text-red-300"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                ticketTiers: [...(formData.ticketTiers || []), { name: '', price: 0, quantity: 100 }]
                                            })}
                                            className="w-full py-2 text-sm font-medium text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-xl border border-primary-500/20 border-dashed transition-all"
                                        >
                                            + Add Ticket Tier
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Total Number of Seats</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.capacity}
                                                onChange={e => {
                                                    const qty = parseInt(e.target.value) || 0
                                                    setFormData({
                                                        ...formData,
                                                        capacity: e.target.value,
                                                        ticketTiers: [{ name: 'Standard Seat', price: formData.ticketTiers?.[0]?.price || 0, quantity: qty }]
                                                    })
                                                }}
                                                className="w-full bg-dark-bg/60 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 focus:bg-dark-bg/80 transition-all text-white placeholder-gray-600"
                                                placeholder="e.g. 100"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Price per Seat ($)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.ticketTiers?.[0]?.price || ''}
                                                onChange={e => {
                                                    const price = parseInt(e.target.value) || 0
                                                    setFormData({
                                                        ...formData,
                                                        ticketTiers: [{ name: 'Standard Seat', price: price, quantity: parseInt(formData.capacity) || 0 }]
                                                    })
                                                }}
                                                className="w-full bg-dark-bg/60 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 focus:bg-dark-bg/80 transition-all text-white placeholder-gray-600"
                                                placeholder="e.g. 50"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">We'll generate a seating chart based on this capacity.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Creating Event...
                                </>
                            ) : (
                                'Launch Event'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
