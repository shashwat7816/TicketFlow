import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import AdminPasses from '../components/AdminPasses'
import AdminSupport from '../components/AdminSupport'

export default function AdminDashboard() {
    const { api } = useAuth()
    const [stats, setStats] = useState(null)
    const [events, setEvents] = useState([])
    const [users, setUsers] = useState([])
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, user: null })
    const [deleteEventConfirmation, setDeleteEventConfirmation] = useState({ show: false, event: null })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [evRes, usRes, statsRes] = await Promise.all([
                api.get('/api/events'),
                api.get('/api/admin/users'),
                api.get('/api/admin/stats')
            ])
            setEvents(evRes.data)
            setUsers(usRes.data)

            setStats({
                totalEvents: evRes.data.length,
                totalUsers: usRes.data.length,
                revenue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(statsRes.data.totalRevenue)
            })
        } catch (e) { console.error(e) }
    }

    function requestDeleteEvent(event) {
        setDeleteEventConfirmation({ show: true, event })
    }

    async function confirmDeleteEvent() {
        if (!deleteEventConfirmation.event) return
        const eventId = deleteEventConfirmation.event._id

        setEvents(prev => prev.filter(e => e._id !== eventId))
        setDeleteEventConfirmation({ show: false, event: null })

        try {
            await api.delete(`/api/admin/events/${eventId}`)
            // Silent success or optional toast
        } catch (e) {
            alert('Failed to delete event: ' + (e.response?.data?.error || e.message))
            loadData()
        }
    }

    function requestDeleteUser(user) {
        setDeleteConfirmation({ show: true, user })
    }

    async function confirmDeleteUser() {
        if (!deleteConfirmation.user) return
        const userId = deleteConfirmation.user._id

        // Optimistic UI update
        setUsers(prev => prev.filter(u => u._id !== userId))
        setDeleteConfirmation({ show: false, user: null })

        try {
            await api.delete(`/api/admin/users/${userId}`)
            // Silent success or optional toast
        } catch (e) {
            alert('Failed to delete user: ' + (e.response?.data?.error || e.message))
            loadData() // Re-fetch to sync if failed
        }
    }

    return (
        <div className="space-y-8 pb-10 relative">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Events', value: stats?.totalEvents || 0, color: 'from-blue-500 to-cyan-400' },
                    { label: 'Active Users', value: stats?.totalUsers || 0, color: 'from-purple-500 to-pink-400' },
                    {
                        label: 'Total Revenue',
                        value: stats?.revenue && stats.revenue !== '-' ? stats.revenue : '$0.00',
                        color: 'from-emerald-500 to-teal-400',
                        isRevenue: true
                    }
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform`}></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.label}</h3>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        {stat.isRevenue && (
                            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-emerald-500 animate-pulse"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold text-white mb-6">Users Management</h2>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-card z-10">
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 font-medium">Name</th>
                                <th className="pb-4 font-medium">Email</th>
                                <th className="pb-4 font-medium">Roles</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(u => (
                                <tr key={u._id} className="text-sm text-gray-300 hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-medium text-white">{u.name}</td>
                                    <td className="py-4">{u.email}</td>
                                    <td className="py-4">
                                        {u.roles?.map(r => (
                                            <span key={r} className="inline-block bg-purple-500/10 text-purple-300 px-2 py-1 rounded text-xs mr-2 border border-purple-500/20">{r}</span>
                                        ))}
                                    </td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => requestDeleteUser(u)}
                                            className="text-red-400 hover:text-red-300 font-medium hover:bg-red-400/10 px-3 py-1 rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Events Table */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold text-white mb-6">Events Management</h2>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-card z-10">
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="pb-4 font-medium">Event Name</th>
                                <th className="pb-4 font-medium">Venue</th>
                                <th className="pb-4 font-medium">Date</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {events.map(e => (
                                <tr key={e._id} className="text-sm text-gray-300 hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-medium text-white">{e.name}</td>
                                    <td className="py-4">{e.venue}</td>
                                    <td className="py-4">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => requestDeleteEvent(e)} className="text-red-400 hover:text-red-300 font-medium hover:bg-red-400/10 px-3 py-1 rounded transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Season Passes */}
            <AdminPasses />

            {/* Support Tickets */}
            <div className="glass-panel p-6 mt-8">
                <h2 className="text-xl font-bold text-white mb-6">Support Helpdesk</h2>
                <AdminSupport />
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-dark-bg border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">Delete User?</h3>
                        <p className="text-gray-400 mb-6 text-center">
                            Are you sure you want to delete <strong className="text-white">{deleteConfirmation.user?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirmation({ show: false, user: null })}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Delete Confirmation Modal */}
            {deleteEventConfirmation.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-dark-bg border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">Delete Event?</h3>
                        <p className="text-gray-400 mb-6 text-center">
                            Are you sure you want to delete <strong className="text-white">{deleteEventConfirmation.event?.name}</strong>? This will cancel all associated tickets.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteEventConfirmation({ show: false, event: null })}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteEvent}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
