const express = require('express')
const router = express.Router()
const Event = require('../models/event')
const Seat = require('../models/seat')

// GET /api/events
router.get('/', async (req, res) => {
  const events = await Event.find().limit(50).lean()
  res.json(events)
})

// GET seating for event (per-seat documents)
router.get('/:id/seating', async (req, res) => {
  const seats = await Seat.find({ eventId: req.params.id }).lean()
  res.json(seats)
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const e = await Event.findById(req.params.id).lean()
  if (!e) return res.status(404).json({ error: 'not found' })
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
      seatingChart: []
    })

    // Generate seats for both types (Seated = specific layouts, General = Ticket #)
    if (event.capacity > 0) {
      const seats = []
      if (event.eventType === 'seated') {
        // Seated: Row/Col
        const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        // Support more than 26 rows? 'AA', 'AB'... for now let's stick to simple labeling or extend if needed.
        // Let's stick to A..Z then A1..Z1 if index > 25? Keeping it simple for now.

        let totalSeatsGenerated = 0
        for (let r = 0; r < seatedRows; r++) {
          const rowLabel = rowLabels[r % rowLabels.length] + (Math.floor(r / rowLabels.length) > 0 ? Math.floor(r / rowLabels.length) : '')
          for (let c = 1; c <= seatedCols; c++) {
            seats.push({
              eventId: event._id,
              seatId: `${rowLabel}-${c}`,
              section: 'General', // Or make this selectable?
              row: rowLabel,
              number: c.toString(),
              status: 'available'
            })
            totalSeatsGenerated++
          }
        }
      } else {
        // General: Ticket # using Tiers
        // If tiers exist, we assign 'section' based on tier name
        // Iterate tiers
        if (event.ticketTiers && event.ticketTiers.length > 0) {
          let globalCount = 1
          for (const tier of event.ticketTiers) {
            for (let i = 0; i < tier.quantity; i++) {
              seats.push({
                eventId: event._id,
                seatId: `${tier.name}-${i + 1}`,
                section: tier.name, // Important for knowing the price later
                row: 'GA',
                number: globalCount.toString(),
                status: 'available',
                price: tier.price // Ideally store price directly on seat if possible, but our model currently doesn't have price. 
                // Wait, SeatSchema doesn't have price. We should rely on Event.ticketTiers lookup or add price to Seat.
                // For now we'll rely on section=tier.name lookup.
              })
              globalCount++
            }
          }
        } else {
          // Fallback old behavior
          for (let i = 1; i <= event.capacity; i++) {
            seats.push({
              eventId: event._id,
              seatId: `Ticket-${i}`,
              section: 'General Admission',
              row: 'GA',
              number: i.toString(),
              status: 'available'
            })
          }
        }
      }
      if (seats.length > 0) await Seat.insertMany(seats)
    }

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
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ error: 'not found' })

    if (event.createdBy && event.createdBy.toString() !== payload.id) {
      return res.status(403).json({ error: 'not authorized' })
    }

    const { name, description, venue, date, bannerUrl } = req.body
    event.name = name || event.name
    event.description = description || event.description
    event.venue = venue || event.venue
    event.date = date || event.date
    event.bannerUrl = bannerUrl || event.bannerUrl
    // Note: Changing capacity/type after creation is complex (what about sold tickets?), skipping for now as per plan

    await event.save()
    res.json(event)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'server error' })
  }
})

module.exports = router
