import mongoose from 'mongoose'

const weatherOverrideLogSchema = new mongoose.Schema({
  region: { type: String, default: 'default' },
  lat: { type: Number },
  lon: { type: Number },
  forecastSummary: { type: String },
  overrideActive: { type: Boolean, default: false },
  reason: { type: String },
  action: { type: String }, // e.g. 'irrigation_paused', 'supply_reduced', 'none'
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.WeatherOverrideLog || mongoose.model('WeatherOverrideLog', weatherOverrideLogSchema)
