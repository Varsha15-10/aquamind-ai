import mongoose from 'mongoose'

const chatLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  reply: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

export default mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema)
