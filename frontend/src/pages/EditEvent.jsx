import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import axios from 'axios'

export default function EditEvent() {
    const { id } = useParams()
    const { api, user } = useAuth()
    const nav = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        venue: '',
        date: '',
        bannerUrl: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch event
        axios.get(import.meta.env.VITE_API_URL + `/api/events/${id}`)
            .then(r => {
                const e = r.data
                // Basic auth check on frontend
                if (user && e.createdBy && e.createdBy !== user.id) {
                    // alert('Not authorized') // strict mode might cause issues, let backend handle or redirect
                }
                setFormData({
                    name: e.name,
                    description: e.description,
                    venue: e.venue,
                    date: e.date ? new Date(e.date).toISOString().slice(0, 16) : '',
                    bannerUrl: e.bannerUrl || ''
                })
                setLoading(false)
            })
            .catch(err => {
                setError('Failed to load event')
                setLoading(false)
            })
    }, [id, user])

    async function submit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api.put(`/api/events/${id}`, formData)
            nav(`/events/${id}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update event')
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-20 text-white">Loading...</div>

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="glass-panel p-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-8">Edit Event</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Event Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image URL</label>
                        <input
                            value={formData.bannerUrl}
                            onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })}
                            className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-white h-32"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Venue</label>
                            <input
                                value={formData.venue}
                                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Date & Time</label>
                            <input
                                type="datetime-local"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-primary-500/25"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
