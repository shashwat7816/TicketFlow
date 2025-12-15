const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReservationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  seatIds: [String],
  expiresAt: Date,
  status: { type: String, enum: ['active','cancelled','fulfilled'], default: 'active' }
}, { timestamps: true })

module.exports = mongoose.model('Reservation', ReservationSchema)
