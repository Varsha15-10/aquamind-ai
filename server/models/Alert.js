import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['leak', 'anomaly', 'drought', 'tip'], default: 'leak' },
  message: { type: String, required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
})

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema)
