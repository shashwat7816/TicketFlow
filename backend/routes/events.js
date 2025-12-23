const express = require('express')
const router = express.Router()
const Event = require('../models/event')
// const Seat = require('../models/seat') // Deprecated

// GET /api/events
router.get('/', async (req, res) => {
  const events = await Event.find().limit(50).lean()
  // Optimization: Don't return huge seatingCharts in list view
  events.forEach(e => delete e.seatingChart)
  res.json(events)
})

// GET seating for event (from embedded array)
router.get('/:id/seating', async (req, res) => {
  const event = await Event.findById(req.params.id, 'seatingChart').lean()
  if (!event) return res.json([])
  res.json(event.seatingChart || [])
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const e = await Event.findById(req.params.id).lean()
  if (!e) return res.status(404).json({ error: 'not found' })
  // Should we strip seatingChart here too if it's large? 
  // Probably fine to leave it, but let's be consistent with list view if we want optimization.
  // For detail view, we usually fetch seating separately or use it here.
  // current frontend calls /seating separate.
  delete e.seatingChart
  res.json(e)
})

// POST /api/events (Create Event)
const jwt = require('jsonwebtoken')
router.post('/', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  try {
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    const user = await require('../models/user').findById(payload.id)
    if (!user || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'admins only' })
    }

    // Create event
    const { name, description, venue, date, bannerUrl, eventType, capacity, ticketTiers, rows: reqRows, cols: reqCols } = req.body

    // Calculate capacity from tiers if general
    let finalCapacity = parseInt(capacity) || 0
    if (eventType === 'general' && Array.isArray(ticketTiers)) {
      finalCapacity = ticketTiers.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0)
    }

    // For seated, calculate capacity from rows * cols
    let seatedRows = 0
    let seatedCols = 0
    if (eventType === 'seated') {
      seatedRows = parseInt(reqRows) || 10
      seatedCols = parseInt(reqCols) || 10
      finalCapacity = seatedRows * seatedCols
    }

    // Generate seats for embedded array
    let generatedSeats = []

    // Logic similar to old Seat generation but pushing to array
    if (finalCapacity > 0) {
      if (eventType === 'seated') {
        const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        let totalSeatsGenerated = 0
        for (let r = 0; r < seatedRows; r++) {
          const rowLabel = rowLabels[r % rowLabels.length] + (Math.floor(r / rowLabels.length) > 0 ? Math.floor(r / rowLabels.length) : '')
          for (let c = 1; c <= seatedCols; c++) {
            generatedSeats.push({
              seatId: `${rowLabel}-${c}`,
              section: 'General',
              row: rowLabel,
              number: c.toString(),
              status: 'available'
            })
            totalSeatsGenerated++
          }
        }
      } else {
        // General
        if (ticketTiers && ticketTiers.length > 0) {
          let globalCount = 1
          for (const tier of ticketTiers) {
            for (let i = 0; i < tier.quantity; i++) {
              generatedSeats.push({
                seatId: `${tier.name}-${i + 1}`,
                section: tier.name,
                row: 'GA',
                number: globalCount.toString(),
                status: 'available'
              })
              globalCount++
            }
          }
        } else {
          // Fallback
          for (let i = 1; i <= finalCapacity; i++) {
            generatedSeats.push({
              seatId: `Ticket-${i}`,
              section: 'General Admission',
              row: 'GA',
              number: i.toString(),
              status: 'available'
            })
          }
        }
      }
    }

    const event = await Event.create({
      name,
      description,
      venue,
      date,
      bannerUrl,
      eventType: eventType || 'general',
      capacity: finalCapacity,
      ticketTiers: Array.isArray(ticketTiers) ? ticketTiers : [],
      createdBy: payload.id,
      seatingChart: generatedSeats
    })

    // No need to insert into Seat collection anymore

    res.status(201).json(event)
  } catch (e) {
    console.error('Create Event Error:', e)
    res.status(401).json({ error: 'invalid token or server error', details: e.message })
  }
})

// PUT /api/events/:id (Edit Event)
router.put('/:id', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  try {
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)

    // Fetch user for admin check
    const user = await require('../models/user').findById(payload.id)

    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ error: 'not found' })

    if (event.createdBy && event.createdBy.toString() !== payload.id && (!user || !user.roles.includes('admin'))) {
      return res.status(403).json({ error: 'not authorized' })
    }

    const { name, description, venue, date, bannerUrl } = req.body
    event.name = name || event.name
    event.description = description || event.description
    event.venue = venue || event.venue
    event.date = date || event.date
    event.bannerUrl = bannerUrl || event.bannerUrl
    // Note: Changing capacity/type after creation is complex, skipping

    await event.save()
    res.json(event)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'server error' })
  }
})

module.exports = router
