import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function EventDetail() {
  const { id } = useParams()
  const { user, api } = useAuth()
  const [event, setEvent] = useState(null)
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState([]) // Array of seatIds
  const [reservation, setReservation] = useState(null)

  // For General events
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [selectedTier, setSelectedTier] = useState(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Poll for seat status every 5 seconds
    const interval = setInterval(fetchSeats, 5000)
    return () => clearInterval(interval)
  }, [id])

  async function fetchData() {
    try {
      const e = await api.get(`/api/events/${id}`)
      setEvent(e.data)
      await fetchSeats()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSeats() {
    try {
      const s = await api.get(`/api/events/${id}/seating`)
      setSeats(s.data)
    } catch (err) { console.error(err) }
  }

  async function holdSeats() {
    let seatsToHold = []

    if (event.eventType === 'seated') {
      if (selected.length === 0) return alert('Select seats')
      seatsToHold = selected
    } else {
      // General with Tiers logic
      if (event.ticketTiers && event.ticketTiers.length > 0 && !selectedTier) {
        return alert('Please select a ticket type.')
      }

      // Filter by tier section if tiers exist
      const available = seats.filter(s => {
        if (selectedTier) return s.status === 'available' && s.section === selectedTier.name
        return s.status === 'available'
      })

      if (available.length < ticketQuantity) return alert('Not enough tickets available in this tier')
      seatsToHold = available.slice(0, ticketQuantity).map(s => s.seatId)
    }

    try {
      const resp = await api.post('/api/reservations', { eventId: id, seatIds: seatsToHold, holdSeconds: 300 })
      setReservation(resp.data)
      setSeats(prev => prev.map(s => seatsToHold.includes(s.seatId) ? { ...s, status: 'reserved' } : s)) // Optimistic update
      fetchSeats() // Sync real status
    } catch (e) {
      alert(e.response?.data?.error || 'Could not hold seats. They might be taken.')
      fetchSeats()
    }
  }

  async function checkout() {
    if (!reservation) return alert('No reservation')
    try {
      const resp = await api.post('/api/orders', {
        reservationId: reservation.reservationId,
        userId: user?._id // explicit fallback for order mapping
      })
      setShowSuccess(true)
      setReservation(null)
      setSelected([])
      fetchSeats()
    } catch (e) {
      alert(e.response?.data?.error || 'Checkout failed')
    }
  }

  if (loading) return <div className="text-center py-20 text-white">Loading...</div>
  if (!event) return <div className="text-center py-20 text-white">Event not found</div>

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Banner */}
      <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-10 group">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} className="w-full h-full object-cover" alt={event.name} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-700">Event</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-xl">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-gray-300 text-lg font-medium">
            <span className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{new Date(event.date).toLocaleString()}</span>
            <span className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>{event.venue}</span>
            <span className="bg-primary-500/20 px-3 py-1 rounded-full text-primary-300 text-sm uppercase tracking-widest border border-primary-500/30">
              {event.eventType === 'seated' ? 'Seated Event' : 'General Admission'}
            </span>
          </div>
        </div>
      </div>

      <div className="md:grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-white mb-4">About this Event</h3>
            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {event.eventType === 'seated' ? 'Select Seats' : 'Select Tickets'}
              </h3>
              {event.eventType === 'seated' && (
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center text-gray-400"><span className="w-3 h-3 bg-white/10 rounded-full mr-2"></span> Available</span>
                  <span className="flex items-center text-gray-400"><span className="w-3 h-3 bg-primary-500 rounded-full mr-2"></span> Selected</span>
                  <span className="flex items-center text-gray-400"><span className="w-3 h-3 bg-red-500/50 rounded-full mr-2"></span> Sold/Reserved</span>
                </div>
              )}
            </div>

            {event.eventType === 'seated' ? (
              <div className="grid grid-cols-10 gap-2 overflow-x-auto pb-4">
                {seats.filter(s => s.status !== 'blocked').sort((a, b) => {
                  if (a.row === b.row) return parseInt(a.number) - parseInt(b.number)
                  return a.row.localeCompare(b.row)
                }).map(s => {
                  const isAlsoSelected = selected.includes(s.seatId)
                  const isAvailable = s.status === 'available'
                  return (
                    <button key={s.seatId}
                      onClick={() => isAvailable && setSelected(sel => sel.includes(s.seatId) ? sel.filter(x => x !== s.seatId) : [...sel, s.seatId])}
                      disabled={!isAvailable}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-t-lg transition-all text-[10px] md:text-xs font-medium flex items-center justify-center
                                         ${isAlsoSelected
                          ? 'bg-primary-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] transform -translate-y-1'
                          : isAvailable
                            ? 'bg-white/10 text-gray-400 hover:bg-white/20'
                            : 'bg-red-500/20 text-red-500 cursor-not-allowed opacity-50'
                        }
                                     `}
                      title={`Row ${s.row} Seat ${s.number}`}
                    >
                      {s.row}{s.number}
                    </button>
                  )
                })}
              </div>
            ) : (
              // General Admission with Tiers
              <div className="py-6">
                <h4 className="text-gray-400 mb-4 font-medium">Select Ticket Type</h4>
                {event.ticketTiers && event.ticketTiers.length > 0 ? (
                  <div className="space-y-3">
                    {event.ticketTiers.map(tier => {
                      // Dynamic availability check
                      const tierSeats = seats.filter(s => s.section === tier.name && s.status === 'available')
                      const availableCount = tierSeats.length

                      return (
                        <div key={tier.name}
                          onClick={() => availableCount > 0 && setSelectedTier(tier)}
                          className={`relative p-4 rounded-xl border transition-all cursor-pointer ${selectedTier?.name === tier.name
                            ? 'bg-primary-500/10 border-primary-500 ring-1 ring-primary-500'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                            } ${availableCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-white text-lg">{tier.name}</span>
                            <span className="font-bold text-white text-xl">${tier.price}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{availableCount} left</span>
                            {selectedTier?.name === tier.name && <span className="text-primary-400 font-bold">Selected</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-gray-400">Standard Ticket (Free)</div>
                )}

                {/* Quantity Selector (Only if Tier selected) */}
                <div className={`mt-6 transition-all ${!selectedTier && event.ticketTiers?.length > 0 ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                  <p className="text-gray-400 mb-2 text-sm">Quantity</p>
                  <div className="inline-flex items-center bg-white/5 rounded-xl p-2 border border-white/5">
                    <button onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-all">-</button>
                    <span className="w-16 text-center text-2xl font-bold text-white">{ticketQuantity}</span>
                    <button onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-all">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 sticky top-24">
            <h4 className="text-lg font-bold text-white mb-4">Your Booking</h4>

            {!reservation ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <span className="text-gray-400 text-sm block mb-1">Items</span>
                  <span className="text-white font-bold">
                    {event.eventType === 'seated'
                      ? (selected.length > 0 ? selected.join(', ') : 'None selected')
                      : (
                        <div className="flex justify-between">
                          <span>{ticketQuantity} x {selectedTier?.name || 'Ticket'}</span>
                          <span>${(selectedTier?.price || 0) * ticketQuantity}</span>
                        </div>
                      )
                    }
                  </span>
                </div>

                {user ? (
                  <button
                    onClick={holdSeats}
                    disabled={event.eventType === 'seated' ? selected.length === 0 : false}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {event.eventType === 'seated' ? 'Reserve Seats' : 'Reserve Tickets'}
                  </button>
                ) : (
                  <Link to="/login" className="block w-full text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all">
                    Login to Book
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
                  Seats Reserved! Expires in 5:00
                </div>
                <div className="text-gray-400 text-sm">
                  Reserved: {reservation.seatIds.join(', ')}
                </div>
                <button
                  onClick={checkout}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 animate-pulse"
                >
                  Confirm Request (Pay)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-bg border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-purple-400"></div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Booking Confirmed!</h2>
              <p className="text-gray-400 mb-6">You're all set for <strong>{event.name}</strong>.</p>

              <Link to="/" className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all mb-3">
                Return Home
              </Link>
              <Link to="/my-tickets" className="block w-full text-primary-400 font-medium text-sm hover:text-white transition-colors">
                View My Tickets
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
