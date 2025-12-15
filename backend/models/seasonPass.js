const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SeasonPassSchema = new Schema({
  name: String,
  validFrom: Date,
  validTo: Date,
  entitlements: Schema.Types.Mixed
}, { timestamps: true })

module.exports = mongoose.model('SeasonPass', SeasonPassSchema)
