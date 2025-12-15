const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    sender: { type: String, enum: ['user', 'admin'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
})

const SupportTicketSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['booking', 'tech', 'account', 'other'], default: 'other' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    messages: [MessageSchema]
}, { timestamps: true })

module.exports = mongoose.model('SupportTicket', SupportTicketSchema)
