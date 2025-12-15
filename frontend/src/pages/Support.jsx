import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { MessageSquare, Plus, Send, Search, HelpCircle, ChevronRight, User, Shield } from 'lucide-react'

export default function Support() {
    const { api, user } = useAuth()
    const [tickets, setTickets] = useState([])
    const [activeTicket, setActiveTicket] = useState(null)
    const [showNew, setShowNew] = useState(false)
    const [replyMsg, setReplyMsg] = useState('')
    const messagesEndRef = useRef(null)

    // Form data
    const [formData, setFormData] = useState({ subject: '', category: 'booking', message: '' })

    useEffect(() => { loadTickets() }, [])

    useEffect(() => {
        if (activeTicket) {
            scrollToBottom()
        }
    }, [activeTicket?.messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    async function loadTickets() {
        try {
            const res = await api.get('/api/support/mine')
            setTickets(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    async function loadThread(id) {
        try {
            const res = await api.get(`/api/support/${id}`)
            setActiveTicket(res.data)
            setShowNew(false)
        } catch (e) { console.error(e) }
    }

    async function createTicket(e) {
        e.preventDefault()
        try {
            const res = await api.post('/api/support', formData)
            setFormData({ subject: '', category: 'booking', message: '' })
            setShowNew(false)
            loadTickets()
            setActiveTicket(res.data)
        } catch (e) { alert('Failed to create ticket') }
    }

    async function sendReply(e) {
        e.preventDefault()
        if (!replyMsg.trim()) return
        try {
            const res = await api.post(`/api/support/${activeTicket._id}/reply`, { message: replyMsg })
            setReplyMsg('')
            setActiveTicket(res.data)
        } catch (e) { alert('Failed to send reply') }
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-100px)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-1/3 glass-panel p-0 flex flex-col overflow-hidden border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <HelpCircle className="text-primary-400" /> Support
                        </h2>
                        <button
                            onClick={() => { setShowNew(true); setActiveTicket(null) }}
                            className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-primary-900/20"
                            title="New Support Request"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    {/* Search Placeholder */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-primary-500 transition-all placeholder-gray-600"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-1 p-2">
                    {tickets.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No tickets yet.</p>
                            <p className="text-xs mt-2">Start a conversation for help!</p>
                        </div>
                    ) : (
                        tickets.map(t => (
                            <div key={t._id}
                                onClick={() => loadThread(t._id)}
                                className={`group p-4 rounded-xl cursor-pointer transition-all border border-transparent
                                   ${activeTicket?._id === t._id
                                        ? 'bg-primary-500/10 border-primary-500/30 shadow-lg'
                                        : 'hover:bg-white/5 hover:border-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold truncate pr-2 ${activeTicket?._id === t._id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {t.subject}
                                    </h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap
                                        ${t.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : t.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}
                                    >
                                        {t.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-sm text-gray-500 truncate max-w-[80%] opacity-80 group-hover:opacity-100 transition-opacity">
                                        {t.messages[t.messages.length - 1]?.content}
                                    </p>
                                    <ChevronRight size={14} className={`text-gray-600 transition-transform ${activeTicket?._id === t._id ? 'opacity-100 translate-x-1 text-primary-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-2/3 glass-panel p-0 overflow-hidden flex flex-col border border-white/10 shadow-2xl relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 to-transparent pointer-events-none"></div>

                {showNew ? (
                    <div className="flex flex-col h-full overflow-y-auto">
                        <div className="p-8 max-w-2xl mx-auto w-full">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/50">
                                    <Send className="text-white transform -rotate-12" size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2">How can we help?</h2>
                                <p className="text-gray-400">Fill out the form below and our team will get back to you shortly.</p>
                            </div>

                            <form onSubmit={createTicket} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-semibold ml-1">Subject</label>
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                                        placeholder="e.g., Cannot download ticket"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-semibold ml-1">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none appearance-none cursor-pointer"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="booking">Booking Issue</option>
                                            <option value="tech">Technical Problem</option>
                                            <option value="account">Account & Privacy</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">▼</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-semibold ml-1">Message</label>
                                    <textarea
                                        rows={6}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none resize-none"
                                        placeholder="Describe your issue in detail..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="pt-4">
                                    <button className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg shadow-purple-900/30">
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : activeTicket ? (
                    <div className="flex flex-col h-full z-10">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center shadow-md z-20">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    {activeTicket.subject}
                                </h2>
                                <div className="flex gap-3 text-xs">
                                    <span className="text-gray-400">ID: <span className="font-mono text-gray-300">{activeTicket._id.slice(-6)}</span></span>
                                    <span className="text-gray-600">•</span>
                                    <span className="capitalize text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">{activeTicket.category}</span>
                                </div>
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border
                                ${activeTicket.status === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : activeTicket.status === 'resolved' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                {activeTicket.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/20 scroll-smooth">
                            {activeTicket.messages.map((m, i) => {
                                const isUser = m.sender === 'user'
                                return (
                                    <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        {!isUser && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg border border-white/10 flex-shrink-0">
                                                <Shield size={14} className="text-primary-400" />
                                            </div>
                                        )}
                                        <div className={`max-w-[70%] group relative ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed
                                                ${isUser
                                                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-none shadow-primary-900/20'
                                                    : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                                                }`}
                                            >
                                                <div className="whitespace-pre-wrap">{m.content}</div>
                                            </div>
                                            <span className={`text-[10px] mt-1.5 px-1 opacity-40 group-hover:opacity-100 transition-opacity ${isUser ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {isUser && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-900 to-purple-900 flex items-center justify-center shadow-lg border border-white/10 flex-shrink-0">
                                                <User size={14} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
                            <form onSubmit={sendReply} className="flex gap-3 max-w-4xl mx-auto">
                                <input
                                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600"
                                    placeholder="Type your reply..."
                                    value={replyMsg}
                                    onChange={e => setReplyMsg(e.target.value)}
                                />
                                <button
                                    disabled={!replyMsg.trim()}
                                    className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary-900/20"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 flex-col bg-black/20">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <MessageSquare size={48} className="opacity-20 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Welcome to Support</h3>
                        <p className="text-gray-500 mb-8">Select a conversation from the left or start a new one.</p>
                        <button
                            onClick={() => { setShowNew(true); setActiveTicket(null) }}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 transition-all"
                        >
                            <Plus size={18} /> New Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
