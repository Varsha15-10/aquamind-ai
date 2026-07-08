import mongoose from 'mongoose'

const zoneMetricSchema = new mongoose.Schema({
  zoneId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  wasteScore: { type: Number, default: 0 }, // 0-100, higher = more waste
  leakProbability: { type: Number, default: 0 }, // 0-1
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.ZoneMetric || mongoose.model('ZoneMetric', zoneMetricSchema)
