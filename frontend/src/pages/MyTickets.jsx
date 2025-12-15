import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Link } from 'react-router-dom'

export default function MyTickets() {
    const { api, user } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            api.get('/api/orders/mine')
                .then(r => setOrders(r.data))
                .catch(e => console.error(e))
                .finally(() => setLoading(false))
        }
    }, [user])

    if (loading) return <div className="text-center py-20 text-white">Loading your tickets...</div>

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent mb-8">My Tickets</h1>

            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order._id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-1/3 h-32 rounded-xl overflow-hidden relative">
                            {order.eventId?.bannerUrl ? (
                                <img src={order.eventId.bannerUrl} alt="Event" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <span className="text-gray-600 font-bold">Ticket</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full text-center md:text-left">
                            <h3 className="text-xl font-bold text-white mb-2">{order.eventId?.name || 'Unknown Event'}</h3>
                            <p className="text-gray-400 mb-4">{new Date(order.eventId?.date).toLocaleString()}</p>

                            <div className="bg-white/5 rounded-lg p-3 inline-block w-full">
                                <span className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Seats / Tickets</span>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {order.tickets.map((t, i) => (
                                        <span key={i} className="bg-primary-500/20 text-primary-300 px-2 py-1 rounded text-sm font-mono border border-primary-500/30">
                                            {t.seatId}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto text-center">
                            <div className="inline-block px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-bold uppercase tracking-wider mb-2">
                                Confirmed
                            </div>
                            <p className="text-xs text-gray-500">Order #{order._id.slice(-6)}</p>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-400 mb-4">You haven't booked any tickets yet.</p>
                        <Link to="/" className="text-primary-400 hover:text-white font-bold">Browse Events</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
