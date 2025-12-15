const express = require('express')
const router = express.Router()
const { authMiddleware, requireRole } = require('../middleware/auth')

const User = require('../models/user')
const Event = require('../models/event')

router.get('/health', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ ok: true, msg: 'admin healthy' })
})

// === USER MANAGEMENT ===
router.get('/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 })
    res.json(users)
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }) }
})

router.delete('/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }) }
})

// === EVENT MANAGEMENT ===
router.delete('/events/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }) }
})

module.exports = router
