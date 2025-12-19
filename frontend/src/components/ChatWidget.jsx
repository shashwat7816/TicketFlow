import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm the TicketFlow AI. How can I help you today?", sender: 'bot' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = { id: Date.now(), text: input, sender: 'user' }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // Simulate AI processing delay
        setTimeout(() => {
            const responseText = generateResponse(userMsg.text)
            const botMsg = { id: Date.now() + 1, text: responseText, sender: 'bot' }
            setMessages(prev => [...prev, botMsg])
            setIsTyping(false)
        }, 1000)
    }

    // Simple rule-based logic for now
    const generateResponse = (text) => {
        const lower = text.toLowerCase()
        if (lower.includes('refund')) return "For refunds, please visit the Support page or contact support@ticketflow.com with your Order ID."
        if (lower.includes('create') || lower.includes('host')) return "You can host an event by clicking 'Host Event' in the navigation menu. Note: You need Admin privileges."
        if (lower.includes('price') || lower.includes('cost')) return "Ticket prices are determined by the event organizer. Check the event details page for specific pricing."
        if (lower.includes('ticket')) return "You can view your purchased tickets in the 'My Tickets' section after logging in."
        if (lower.includes('hello') || lower.includes('hi')) return "Hello! Feel free to ask me about events, tickets, or account issues."
        return "I'm still learning! Try asking about 'refunds', 'hosting events', or 'my tickets'."
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[500px] bg-dark-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">TicketFlow Assistant</h3>
                                <p className="text-white/70 text-xs">Always here to help</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/20">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-primary-500/30 transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-gray-700 text-white rotate-90' : 'bg-gradient-to-br from-primary-500 to-purple-600 text-white'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}

                {!isOpen && (
                    <span className="absolute right-0 top-0 w-3 h-3 bg-red-500 rounded-full border-2 border-dark-bg"></span>
                )}
            </button>
        </div>
    )
}
