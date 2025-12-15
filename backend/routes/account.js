const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const User = require('../models/user')
const Order = require('../models/order')
const Reservation = require('../models/reservation')

// Get account summary
router.get('/', authMiddleware, async (req,res)=>{
  try{
    const user = await User.findById(req.user.id).lean()
    if(!user) return res.status(404).json({ error: 'user not found' })
    const reservationsCount = await Reservation.countDocuments({ userId: user._id })
    const ordersCount = await Order.countDocuments({ userId: user._id })
    res.json({ id: user._id, email: user.email, name: user.name, roles: user.roles, reservationsCount, ordersCount })
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Get orders for current user
router.get('/orders', authMiddleware, async (req,res)=>{
  try{
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean()
    res.json(orders)
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Get reservations for current user
router.get('/reservations', authMiddleware, async (req,res)=>{
  try{
    const reservations = await Reservation.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean()
    res.json(reservations)
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Get season passes for current user (via user.seasonPasses)
router.get('/season-passes', authMiddleware, async (req,res)=>{
  try{
    const user = await User.findById(req.user.id).populate('seasonPasses').lean()
    res.json(user.seasonPasses || [])
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

module.exports = router
