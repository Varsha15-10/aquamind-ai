import mongoose from 'mongoose'

const scarcityLevelSchema = new mongoose.Schema({
  region: { type: String, required: true, unique: true },
  level: { type: String, enum: ['normal', 'moderate', 'severe', 'critical'], default: 'normal' },
  multiplier: { type: Number, default: 1.0 }, // pricing surge multiplier
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'system' },
})

export default mongoose.models.ScarcityLevel || mongoose.model('ScarcityLevel', scarcityLevelSchema)
