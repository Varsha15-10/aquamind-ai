import mongoose from 'mongoose'

const tenantProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tenantRole: {
    type: String,
    enum: ['municipal_engineer', 'admin_supervisor', 'consumer'],
    default: 'consumer',
  },
  region: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.TenantProfile || mongoose.model('TenantProfile', tenantProfileSchema)
