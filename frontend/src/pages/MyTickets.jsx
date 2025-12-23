import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function MyTickets() {
    const { api, user } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(null)
    const [cancelling, setCancelling] = useState(null)
    const [confirmModal, setConfirmModal] = useState(null)

    useEffect(() => {
        if (user) {
            api.get('/api/orders/mine')
                .then(r => setOrders(r.data.filter(o => o.orderType !== 'season_pass')))
                .catch(e => console.error(e))
                .finally(() => setLoading(false))
        }
    }, [user])

    const handleDownloadTicket = async (orderId) => {
        console.log("Starting download for order:", orderId)
        setDownloading(orderId)

        // Target the simplified printable version instead of the complex Tailwind one
        // This avoids Tailwind v4 oklch/oklab parsing errors in html2canvas
        const element = document.getElementById(`printable-ticket-${orderId}`)
        if (!element) {
            console.error("Ticket element not found:", `printable-ticket-${orderId}`)
            setDownloading(null)
            return
        }

        try {
            console.log("Capturing element with html2canvas...")
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Timeout: Ticket generation took too long")), 10000)
            })

            const canvas = await Promise.race([
                html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#1e293b' // Match the card bg
                }),
                timeoutPromise
            ])

            console.log("Canvas captured, converting to data URL...")
            const imgData = canvas.toDataURL('image/png')

            console.log("Generating PDF...")
            // Use landscape layout for the ticket
            const pdf = new jsPDF('l', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight)
            pdf.save(`ticket-${orderId}.pdf`)
            console.log("PDF saved")
        } catch (error) {
            console.error('Error generating ticket PDF:', error)
            alert(`Failed to generate PDF: ${error.message}.`)
        } finally {
            console.log("Resetting download state")
            setDownloading(null)
        }
    }

    const handleCancelClick = (order) => {
        setConfirmModal(order)
    }

    const confirmCancel = async () => {
        if (!confirmModal) return
        setCancelling(confirmModal._id)
        try {
            await api.put(`/api/orders/${confirmModal._id}/cancel`)

            // Update local state
            setOrders(orders.map(o =>
                o._id === confirmModal._id ? { ...o, status: 'cancelled' } : o
            ))
            setConfirmModal(null)
        } catch (e) {
            console.error('Error cancelling ticket:', e)
            alert('Failed to cancel ticket')
        } finally {
            setCancelling(null)
        }
    }

    if (loading) return <div className="text-center py-20 text-white">Loading your tickets...</div>

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent mb-8">My Tickets</h1>

            <div className="space-y-6">
                {orders.map(order => (
                    <div id={`ticket-${order._id}`} key={order._id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-1/3 h-32 rounded-xl overflow-hidden relative">
                            {order.eventId?.bannerUrl ? (
                                <img src={order.eventId.bannerUrl} alt="Event" className="w-full h-full object-cover" crossOrigin="anonymous" />
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

                        <div className="w-full md:w-auto text-center flex flex-col items-center gap-3">
                            {order.status === 'cancelled' ? (
                                <div className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold uppercase tracking-wider">
                                    Cancelled
                                </div>
                            ) : (
                                <div className="inline-block px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-bold uppercase tracking-wider">
                                    Confirmed
                                </div>
                            )}
                            <p className="text-xs text-gray-500">Order #{order._id.slice(-6)}</p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownloadTicket(order._id)}
                                    disabled={downloading === order._id || order.status === 'cancelled'}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    data-html2canvas-ignore
                                >
                                    <Download size={16} />
                                    {downloading === order._id ? '...' : 'Download'}
                                </button>

                                {order.status !== 'cancelled' && (
                                    <button
                                        onClick={() => handleCancelClick(order)}
                                        disabled={cancelling === order._id}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        data-html2canvas-ignore
                                    >
                                        {cancelling === order._id ? '...' : 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Hidden Printable Tickets Container */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    {orders.map(order => (
                        <div
                            id={`printable-ticket-${order._id}`}
                            key={`print-${order._id}`}
                            style={{
                                width: '800px',
                                padding: '40px',
                                backgroundColor: '#1e293b', // slate-800
                                color: 'white',
                                borderRadius: '12px',
                                fontFamily: 'sans-serif',
                                border: '1px solid #334155'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                {/* Banner */}
                                <div style={{ width: '250px', height: '150px', overflow: 'hidden', borderRadius: '8px', flexShrink: 0 }}>
                                    {order.eventId?.bannerUrl ? (
                                        <img
                                            src={order.eventId.bannerUrl}
                                            alt="Event"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            crossOrigin="anonymous"
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>TICKET</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#f8fafc' }}>{order.eventId?.name || 'Unknown Event'}</h2>
                                    <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '16px' }}>{new Date(order.eventId?.date).toLocaleString()}</p>

                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '8px' }}>
                                            Seats / Tickets
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {order.tickets.map((t, i) => (
                                                <span key={i} style={{
                                                    backgroundColor: 'rgba(14, 165, 233, 0.2)', // primary-500/20 forced rgba
                                                    color: '#7dd3fc', // primary-300
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                    border: '1px solid rgba(14, 165, 233, 0.3)'
                                                }}>
                                                    {t.seatId}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '8px 16px',
                                        borderRadius: '9999px',
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500/10
                                        color: '#4ade80', // green-400
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        marginBottom: '8px'
                                    }}>
                                        Confirmed
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Order #{order._id.slice(-6)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-400 mb-4">You haven't booked any tickets yet.</p>
                        <Link to="/" className="text-primary-400 hover:text-white font-bold">Browse Events</Link>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2">Cancel Ticket?</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to cancel your ticket for <span className="text-white font-semibold">{confirmModal.eventId?.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors font-medium"
                            >
                                Keep Ticket
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-bold shadow-lg shadow-red-500/20"
                            >
                                Yes, Cancel It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
