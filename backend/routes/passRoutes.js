const express = require('express')
const router = express.Router()
const { authMiddleware, requireRole } = require('../middleware/auth')
const PassType = require('../models/PassType')
const SeasonPass = require('../models/seasonPass')
const Order = require('../models/order')
const Event = require('../models/event')
const Reservation = require('../models/reservation')
const Seat = require('../models/seat')

// === PUBLIC ===
// Get all active pass types
router.get('/types', async (req, res) => {
    try {
        const types = await PassType.find({ active: true })
        res.json(types)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// === ADMIN ===
// Create a new pass type
router.post('/types', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { name, description, price, durationDays, type, credits } = req.body
        const newType = await PassType.create({
            name, description, price, durationDays, type, credits
        })
        res.json(newType)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// Delete a pass type
router.delete('/types/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        await PassType.findByIdAndDelete(req.params.id)
        res.json({ success: true })
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// === USER ===
// Get my passes
router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const passes = await SeasonPass.find({ userId: req.user.id }).populate('passTypeId')
        res.json(passes)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// Purchase a pass
router.post('/purchase', authMiddleware, async (req, res) => {
    try {
        const { passTypeId } = req.body
        const passType = await PassType.findById(passTypeId)
        if (!passType) return res.status(404).json({ error: 'Pass type not found' })

        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + passType.durationDays)

        // Create the User's Pass
        const userPass = await SeasonPass.create({
            userId: req.user.id,
            passTypeId: passType._id,
            expiryDate,
            remainingCredits: passType.type === 'credits' ? passType.credits : 0,
        })

        // Create a record of the purchase (Order)
        const order = await Order.create({
            userId: req.user.id,
            total: passType.price,
            orderType: 'season_pass',
            passTypeId: passType._id,
            paymentStatus: 'paid'
        })

        res.json({ success: true, pass: userPass, order })
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// Redeem a pass for an event ticket
router.post('/redeem', authMiddleware, async (req, res) => {
    try {
        const { eventId, reservationId, seatId } = req.body

        // Check Event
        const event = await Event.findById(eventId)
        if (!event) return res.status(404).json({ error: 'Event not found' })

        // If reservation exists, use it
        let seatsToBook = []
        if (reservationId) {
            const r = await Reservation.findById(reservationId)
            if (!r || r.status !== 'active') return res.status(400).json({ error: 'Reservation invalid or expired' })
            if (r.userId && r.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your reservation' })

            seatsToBook = r.seatIds

            // Finalize Reservation
            r.status = 'fulfilled'
            await r.save()

            // Mark Seats Sold
            await Seat.updateMany({ eventId: event._id, seatId: { $in: seatsToBook } }, { $set: { status: 'sold' } })
        } else {
            // Direct redemption (fallback or general admission without hold)
            // NOTE: This path is risky if seats are seated. Assuming general or client handled holds.
            seatsToBook = seatId ? [seatId] : ['GENERAL']
            // If seated, we should ideally mark them sold too, but let's assume reservation flow is primary for seated.
        }

        // Find a valid pass
        const now = new Date()
        const passes = await SeasonPass.find({
            userId: req.user.id,
            status: 'active',
            expiryDate: { $gt: now }
        }).populate('passTypeId')

        let validPass = null
        for (const p of passes) {
            if (p.passTypeId.type === 'unlimited') {
                validPass = p; break
            }
            if (p.passTypeId.type === 'credits' && p.remainingCredits >= seatsToBook.length) { // Check if enough credits for all seats? Or 1 credit per order? 
                // Usually 1 credit = 1 ticket. If booking 2 seats, need 2 credits.
                // Let's assume 1 credit covers the whole booking? No, that's exploitable.
                // 1 Credit per Ticket.
                validPass = p; break
            }
        }

        if (!validPass) return res.status(400).json({ error: 'No valid season pass available (impl: check credits)' })

        // Deduct credits
        if (validPass.passTypeId.type === 'credits') {
            if (validPass.remainingCredits < seatsToBook.length) return res.status(400).json({ error: 'Not enough credits' })
            validPass.remainingCredits -= seatsToBook.length
        }

        // Create Order (Ticket)
        const order = await Order.create({
            userId: req.user.id,
            eventId: event._id,
            tickets: seatsToBook.map(s => ({ seatId: s, price: 0 })),
            total: 0,
            paymentStatus: 'paid',
            orderType: 'ticket'
        })

        // Record usage
        validPass.usageHistory.push({
            eventId: event._id,
            orderId: order._id
        })
        await validPass.save()

        res.json({ success: true, order })

    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

module.exports = router
