import mongoose from 'mongoose'

const usageRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  liters: { type: Number, required: true },
})

export default mongoose.models.UsageRecord || mongoose.model('UsageRecord', usageRecordSchema)
