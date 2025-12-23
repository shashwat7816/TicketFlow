const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  tickets: [{ seatId: String, price: Number }],
  // New fields for Season Pass
  orderType: { type: String, enum: ['ticket', 'season_pass'], default: 'ticket' },
  passTypeId: { type: Schema.Types.ObjectId, ref: 'PassType' },

  total: Number,
  status: { type: String, enum: ['reserved', 'pending_payment', 'paid', 'cancelled', 'active'], default: 'reserved' },
  expiresAt: { type: Date, index: true }, // For temporary reservations
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'paid_by_pass'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model('Order', OrderSchema)
