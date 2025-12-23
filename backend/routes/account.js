const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const User = require('../models/user')
const Order = require('../models/order')
// const Reservation = require('../models/reservation')

// Get account summary
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean()
    if (!user) return res.status(404).json({ error: 'user not found' })
    const reservationsCount = await Order.countDocuments({ userId: user._id, status: 'reserved' })
    const ordersCount = await Order.countDocuments({ userId: user._id, status: { $ne: 'reserved' } })
    res.json({ id: user._id, email: user.email, name: user.name, roles: user.roles, reservationsCount, ordersCount })
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Get orders for current user
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id, status: { $ne: 'reserved' } }).sort({ createdAt: -1 }).lean()
    res.json(orders)
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Get reservations for current user
router.get('/reservations', authMiddleware, async (req, res) => {
  try {
    // Now querying Orders that are in 'reserved' state
    const reservations = await Order.find({ userId: req.user.id, status: 'reserved' }).sort({ createdAt: -1 }).limit(10).lean()
    // Map to old structure if needed, or just return. Order has tickets[{seatId, price}], Reservation had seatIds[]
    // Let's transform to match expected frontend interface for seatIds:
    const mapped = reservations.map(r => ({
      ...r,
      seatIds: r.tickets.map(t => t.seatId)
    }))
    res.json(mapped)
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Get season passes for current user (via user.seasonPasses)
router.get('/season-passes', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('seasonPasses').lean()
    res.json(user.seasonPasses || [])
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

module.exports = router
