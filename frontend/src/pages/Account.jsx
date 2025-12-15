import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'

export default function Account(){
  const { api, user } = useAuth()
  const nav = useNavigate()
  const [summary, setSummary] = useState(null)
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [passes, setPasses] = useState([])

  useEffect(()=>{
    if(!user) return nav('/login')
    (async ()=>{
      try{
        const s = await api.get('/api/account')
        setSummary(s.data)
        const o = await api.get('/api/account/orders')
        setOrders(o.data)
        const r = await api.get('/api/account/reservations')
        setReservations(r.data)
        const p = await api.get('/api/account/season-passes')
        setPasses(p.data)
      }catch(e){ console.error(e) }
    })()
  }, [user])

  if(!summary) return <div>Loading account...</div>

  return (
    <div>
      <h2>Account</h2>
      <p>Welcome, <strong>{summary.name || summary.email}</strong></p>
      <section>
        <h3>Orders ({summary.ordersCount})</h3>
        <ul>
          {orders.map(o => (
            <li key={o._id}>Order {o._id} — {o.tickets.length} tickets — {o.paymentStatus}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Reservations ({summary.reservationsCount})</h3>
        <ul>
          {reservations.map(r => (
            <li key={r._id}>Reservation {r._id} — Seats: {r.seatIds.join(', ')} — Expires: {new Date(r.expiresAt).toLocaleString()}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Season Passes</h3>
        <ul>
          {passes.map(p => (
            <li key={p._id}>{p.name} — valid {new Date(p.validFrom).toLocaleDateString()} to {new Date(p.validTo).toLocaleDateString()}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
