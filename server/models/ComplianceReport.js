import mongoose from 'mongoose'

const complianceReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, enum: ['environmental_compliance', 'esg', 'daily_audit'], required: true },
  periodStart: { type: Date },
  periodEnd: { type: Date },
  metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
  generatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.ComplianceReport || mongoose.model('ComplianceReport', complianceReportSchema)
