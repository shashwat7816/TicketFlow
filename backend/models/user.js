const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  roles: { type: [String], default: ['customer'] },
  name: String,
  seasonPasses: [{ type: Schema.Types.ObjectId, ref: 'SeasonPass' }]
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
