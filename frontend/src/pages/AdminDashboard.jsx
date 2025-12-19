import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import AdminPasses from '../components/AdminPasses'
import AdminSupport from '../components/AdminSupport'

export default function AdminDashboard() {
    const { api } = useAuth()
    const [stats, setStats] = useState(null)
    const [events, setEvents] = useState([])
    const [users, setUsers] = useState([])

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

    async function deleteEvent(id) {
        if (!window.confirm('Delete this event?')) return
        try {
            // Optimistic update
            setEvents(prev => prev.filter(e => e._id !== id))
            await api.delete(`/api/admin/events/${id}`)
            alert('Event deleted successfully')
            loadData()
        } catch (e) {
            alert('Failed to delete event: ' + (e.response?.data?.error || e.message))
            loadData() // Re-fetch to sync state if failed
        }
    }

    async function deleteUser(id) {
        if (!window.confirm('Delete this user?')) return
        try {
            setUsers(prev => prev.filter(u => u._id !== id))
            await api.delete(`/api/admin/users/${id}`)
            alert('User deleted successfully')
            loadData()
        } catch (e) {
            alert('Failed to delete user: ' + (e.response?.data?.error || e.message))
            loadData()
        }
    }

    return (
        <div className="space-y-8 pb-10">
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
                                        <button onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-300 font-medium hover:bg-red-400/10 px-3 py-1 rounded transition-colors">Delete</button>
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
                                        <button onClick={() => deleteEvent(e._id)} className="text-red-400 hover:text-red-300 font-medium hover:bg-red-400/10 px-3 py-1 rounded transition-colors">Delete</button>
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
        </div>
    )
}
