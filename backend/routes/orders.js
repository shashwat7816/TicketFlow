const express = require('express')
const router = express.Router()
const Order = require('../models/order')
// const Seat = require('../models/seat') // Deprecated
const Event = require('../models/event')
const mongoose = require('mongoose')

// Helper: Verify Token
const getUserId = (req) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return null
  try {
    const jwt = require('jsonwebtoken')
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    return payload.id
  } catch (e) { return null }
}

// 1. Create Order (Reserve Seats)
router.post('/', async (req, res) => {
  try {
    const { eventId, userId, seatIds, holdSeconds } = req.body

    // Finalize Logic
    if (req.body.reservationId) {
      return await finalizeOrder(req, res)
    }

    if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0)
      return res.status(400).json({ error: 'invalid input' })

    // 1. Reserve Seats using Event embedded array update
    const reservedWithDetails = []

    // Loop through each seat to lock it atomically
    for (const sid of seatIds) {
      // Find event where this specific seat is available and update it
      const event = await Event.findOneAndUpdate(
        {
          _id: eventId,
          seatingChart: {
            $elemMatch: { seatId: sid, status: 'available' }
          }
        },
        {
          $set: { "seatingChart.$.status": "reserved" }
        },
        { new: true } // returns updated doc
      );

      if (event) {
        // Find the seat details from the returned doc
        const seat = event.seatingChart.find(s => s.seatId === sid)
        if (seat) reservedWithDetails.push({ seatId: sid, price: 0, section: seat.section })
      } else {
        break; // One failed, stop
      }
    }

    if (reservedWithDetails.length !== seatIds.length) {
      // Rollback
      const reservedIds = reservedWithDetails.map(x => x.seatId)
      if (reservedIds.length > 0) {
        await Event.updateOne(
          { _id: eventId },
          { $set: { "seatingChart.$[elem].status": "available" } },
          { arrayFilters: [{ "elem.seatId": { $in: reservedIds } }] }
        )
      }
      const unavailable = seatIds.filter(sid => !reservedIds.includes(sid))
      return res.status(409).json({ error: 'some seats not available', seats: unavailable })
    }

    // 2. Calculate Price
    // We already have section info from reservedWithDetails (if query returned fully)
    // But `findOneAndUpdate` returns the Whole Event, so we have the data.

    // Re-fetch event to get current state (or use returned doc if we loop properly, but simpler to just use what we have)
    const event = await Event.findById(eventId)
    let total = 0

    const tickets = reservedWithDetails.map(t => {
      let price = 0
      if (event.eventType === 'seated') {
        if (event.ticketTiers?.[0]) price = event.ticketTiers[0].price
      } else {
        const tier = event.ticketTiers?.find(tr => tr.name === t.section)
        if (tier) price = tier.price
      }
      total += price
      return { seatId: t.seatId, price }
    })

    // 3. Create Order
    const expiresAt = new Date(Date.now() + (holdSeconds || 5 * 60) * 1000)
    const finalUserId = getUserId(req) || userId

    const order = await Order.create({
      userId: finalUserId,
      eventId,
      tickets,
      total,
      status: 'reserved',
      paymentStatus: 'pending',
      expiresAt
    })

    res.status(201).json({ reservationId: order._id, orderId: order._id, expiresAt, seatIds, total })

  } catch (err) {
    console.error(err)
    // Rollback just in case
    try {
      if (req.body.seatIds) {
        await Event.updateOne(
          { _id: req.body.eventId },
          { $set: { "seatingChart.$[elem].status": "available" } },
          { arrayFilters: [{ "elem.seatId": { $in: req.body.seatIds } }] }
        )
      }
    } catch (e) { }
    res.status(500).json({ error: 'internal' })
  }
})

// Finalize
async function finalizeOrder(req, res) {
  try {
    const { reservationId, userId } = req.body
    const order = await Order.findById(reservationId)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (order.status !== 'reserved') {
      if (order.status === 'paid' || order.status === 'active') return res.status(200).json({ orderId: order._id })
      return res.status(400).json({ error: 'Order cannot be paid (expired or cancelled)' })
    }

    const finalUserId = getUserId(req) || userId
    if (finalUserId && !order.userId) order.userId = finalUserId

    order.status = 'paid'
    order.paymentStatus = 'paid'

    // Update Seats to 'sold'
    const seatIds = order.tickets.map(t => t.seatId)
    await Event.updateOne(
      { _id: order.eventId },
      { $set: { "seatingChart.$[elem].status": "sold" } },
      { arrayFilters: [{ "elem.seatId": { $in: seatIds } }] }
    )

    await order.save()
    res.status(201).json({ orderId: order._id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Data error' })
  }
}

// GET /api/orders/mine
router.get('/mine', async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'missing token' })
  try {
    const orders = await Order.find({ userId }).populate('eventId').sort({ createdAt: -1 }).lean()
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

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'missing token' })
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (order.userId && order.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' })
    }

    order.status = 'cancelled'
    await order.save()

    // Release seats
    const seatIds = order.tickets.map(t => t.seatId)
    if (seatIds.length > 0) {
      await Event.updateOne(
        { _id: order.eventId },
        { $set: { "seatingChart.$[elem].status": "available" } },
        { arrayFilters: [{ "elem.seatId": { $in: seatIds } }] }
      )
    }

    res.json({ message: 'Order cancelled successfully', order })
  } catch (e) {
    console.error('Cancellation error:', e)
    res.status(500).json({ error: 'internal server error' })
  }
})

module.exports = router
