const express = require('express')
const router = express.Router()
const Reservation = require('../models/reservation')
const Order = require('../models/order')
const Seat = require('../models/seat')
const Event = require('../models/event')

// Create an order from a reservation (mock payment)
router.post('/', async (req, res) => {
  try {
    const { reservationId, userId } = req.body
    if (!reservationId) return res.status(400).json({ error: 'reservationId required' })

    // Try to get userId from token for better security, fallback to body
    let finalUserId = userId
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken')
        const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
        finalUserId = payload.id
      } catch (e) { console.error('Token verification failed during order creation', e) }
    }

    const r = await Reservation.findById(reservationId)
    if (!r || r.status !== 'active') return res.status(400).json({ error: 'invalid reservation' })

    // If reservation has a user, use that. Otherwise use the one from request/token
    const orderUserId = r.userId || finalUserId

    // Mock payment success
    // create order and mark seats sold
    const event = await Event.findById(r.eventId)

    // convert seats status to sold (per-seat docs)
    await Seat.updateMany({ eventId: r.eventId, seatId: { $in: r.seatIds } }, { $set: { status: 'sold' } })

    // Calculate price based on event type / tiers
    let total = 0
    const seatsDocs = await Seat.find({ eventId: r.eventId, seatId: { $in: r.seatIds } })
    const seatMap = {}
    seatsDocs.forEach(s => seatMap[s.seatId] = s)

    const tickets = r.seatIds.map(sid => {
      let price = 0
      const s = seatMap[sid]
      if (s) {
        if (event.eventType === 'seated') {
          // For seated, we currently assume single price tier or first tier
          if (event.ticketTiers && event.ticketTiers.length > 0) price = event.ticketTiers[0].price
        } else {
          // General: match section to tier name
          if (event.ticketTiers) {
            const tier = event.ticketTiers.find(t => t.name === s.section)
            if (tier) price = tier.price
          }
        }
      }
      total += price
      return { seatId: sid, price }
    })

    const order = await Order.create({
      userId: orderUserId,
      eventId: r.eventId,
      tickets,
      total,
      paymentStatus: 'paid'
    })

    r.status = 'fulfilled'
    await r.save()

    res.status(201).json({ orderId: order._id })
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// GET /api/orders/mine
router.get('/mine', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  try {
    const jwt = require('jsonwebtoken')
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)

    // Find orders for this user
    // Populate event details for display
    const orders = await Order.find({ userId: payload.id }).populate('eventId').sort({ createdAt: -1 }).lean()
    res.json(orders)
  } catch (e) {
    console.error(e)
    res.status(401).json({ error: 'invalid token' })
  }
})

// Get order
router.get('/:id', async (req, res) => {
  try {
    const o = await Order.findById(req.params.id).lean()
    if (!o) return res.status(404).json({ error: 'not found' })
    res.json(o)
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

module.exports = router
