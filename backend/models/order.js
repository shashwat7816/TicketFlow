const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  tickets: [{ seatId: String, price: Number }],
  total: Number,
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model('Order', OrderSchema)
