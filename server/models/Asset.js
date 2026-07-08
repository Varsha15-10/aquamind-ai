import mongoose from 'mongoose'

const flowReadingSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  flowRate: { type: Number, required: true }, // liters/min or similar unit
  pressure: { type: Number }, // optional PSI/bar reading
}, { _id: false })

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['pipe', 'pump', 'valve', 'meter'], default: 'pipe' },
  zone: { type: String, default: 'unassigned' },
  installedAt: { type: Date },
  flowReadings: { type: [flowReadingSchema], default: [] },
  riskScore: { type: Number, default: 0 }, // 0-100
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  predictedFailureInDays: { type: Number, default: null },
  lastPredictedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Asset || mongoose.model('Asset', assetSchema)
