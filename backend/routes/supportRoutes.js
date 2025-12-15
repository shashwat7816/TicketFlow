const express = require('express')
const router = express.Router()
const { authMiddleware, requireRole } = require('../middleware/auth')
const SupportTicket = require('../models/SupportTicket')

// === PUBLIC / USER ===

// Get my tickets
router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ updatedAt: -1 })
        res.json(tickets)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// Get single ticket (User or Admin)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id).populate('userId', 'name email')
        if (!ticket) return res.status(404).json({ error: 'not found' })

        // Access Check
        if (req.user.roles.includes('admin') || ticket.userId._id.toString() === req.user.id) {
            res.json(ticket)
        } else {
            res.status(403).json({ error: 'forbidden' })
        }
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// Create ticket
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { subject, category, message } = req.body
        const ticket = await SupportTicket.create({
            userId: req.user.id,
            subject,
            category,
            messages: [{
                sender: 'user',
                content: message,
                timestamp: new Date()
            }]
        })
        res.json(ticket)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// Reply to ticket (User or Admin)
router.post('/:id/reply', authMiddleware, async (req, res) => {
    try {
        const { message } = req.body
        const ticket = await SupportTicket.findById(req.params.id)
        if (!ticket) return res.status(404).json({ error: 'not found' })

        // Access + Role determination
        let senderRole = 'user'
        if (ticket.userId.toString() === req.user.id) {
            // User replying
            ticket.status = 'open' // Re-open if closed? Or just flag as updated?
            // If admin had marked resolved, user reply acts as "not resolved"
            if (ticket.status === 'resolved') ticket.status = 'in_progress'
        } else if (req.user.roles.includes('admin')) {
            // Admin replying
            senderRole = 'admin'
            ticket.status = 'in_progress' // Auto mark in progress
        } else {
            return res.status(403).json({ error: 'forbidden' })
        }

        ticket.messages.push({
            sender: senderRole,
            content: message,
            timestamp: new Date()
        })

        await ticket.save()
        res.json(ticket)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// === ADMIN ===

// Get ALL tickets
router.get('/admin/all', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const tickets = await SupportTicket.find({}).populate('userId', 'name email').sort({ updatedAt: -1 })
        res.json(tickets)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

// Update status
router.put('/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { status } = req.body
        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true })
        res.json(ticket)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal' })
    }
})

module.exports = router
