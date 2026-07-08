import mongoose from 'mongoose'

const escalationLogSchema = new mongoose.Schema({
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
  technicianName: { type: String, default: 'Unassigned' },
  technicianContact: { type: String, default: '' },
  channel: { type: String, enum: ['whatsapp', 'sms'], default: 'whatsapp' },
  status: { type: String, enum: ['pending', 'sent', 'acknowledged'], default: 'pending' },
  triggeredAt: { type: Date, default: Date.now },
  acknowledgedAt: { type: Date, default: null },
})

export default mongoose.models.EscalationLog || mongoose.model('EscalationLog', escalationLogSchema)
