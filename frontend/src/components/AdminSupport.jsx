import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Send } from 'lucide-react'

export default function AdminSupport() {
    const { api } = useAuth()
    const [tickets, setTickets] = useState([])
    const [activeTicket, setActiveTicket] = useState(null)
    const [replyMsg, setReplyMsg] = useState('')

    useEffect(() => { loadTickets() }, [])

    async function loadTickets() {
        try {
            const res = await api.get('/api/support/admin/all')
            setTickets(res.data)
        } catch (e) { console.error(e) }
    }

    async function sendReply(e) {
        e.preventDefault()
        if (!replyMsg.trim()) return
        try {
            const res = await api.post(`/api/support/${activeTicket._id}/reply`, { message: replyMsg })
            setReplyMsg('')
            setActiveTicket(res.data)
            loadTickets() // Refresh list status
        } catch (e) { alert('Failed to send reply') }
    }

    async function updateStatus(status) {
        try {
            const res = await api.put(`/api/support/${activeTicket._id}/status`, { status })
            setActiveTicket(res.data)
            loadTickets()
        } catch (e) { alert('Error updating status') }
    }

    return (
        <div className="glass-panel p-0 h-[600px] flex overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 bg-black/20">
                    <h3 className="font-bold text-white">All Tickets</h3>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {tickets.map(t => (
                        <div key={t._id}
                            onClick={() => setActiveTicket(t)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 ${activeTicket?._id === t._id ? 'bg-white/5 border-l-2 border-primary-500' : ''}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${t.status === 'open' ? 'bg-green-500/20 text-green-400' : t.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{t.status}</span>
                                <span className="text-xs text-gray-500">{new Date(t.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-white text-sm truncate">{t.subject}</h4>
                            <p className="text-xs text-gray-400 truncate">{t.userId?.name || 'Unknown'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col">
                {activeTicket ? (
                    <>
                        <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">{activeTicket.subject}</h3>
                                <p className="text-xs text-gray-400">User: {activeTicket.userId?.name} ({activeTicket.userId?.email})</p>
                            </div>
                            <select
                                className="bg-black/40 border border-white/10 text-xs text-white rounded px-2 py-1"
                                value={activeTicket.status}
                                onChange={(e) => updateStatus(e.target.value)}
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/20">
                            {activeTicket.messages.map((m, i) => (
                                <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${m.sender === 'admin' ? 'bg-primary-600/80 text-white' : 'bg-white/10 text-gray-300'}`}>
                                        <p className="whitespace-pre-wrap">{m.content}</p>
                                        <p className="text-[10px] mt-1 opacity-50 text-right">{new Date(m.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-black/30">
                            <form onSubmit={sendReply} className="flex gap-2">
                                <input
                                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 w-full"
                                    placeholder="Reply as Admin..."
                                    value={replyMsg}
                                    onChange={e => setReplyMsg(e.target.value)}
                                />
                                <button className="bg-primary-600 text-white px-4 rounded-lg hover:bg-primary-500">
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">Select a ticket</div>
                )}
            </div>
        </div>
    )
}
