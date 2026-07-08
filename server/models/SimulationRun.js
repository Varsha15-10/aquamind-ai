import mongoose from 'mongoose'

const simulationRunSchema = new mongoose.Schema({
  scenarioType: { type: String, enum: ['drought', 'flood'], required: true },
  intensity: { type: String, enum: ['mild', 'moderate', 'severe', 'extreme'], default: 'moderate' },
  durationDays: { type: Number, default: 7 },
  region: { type: String, default: 'default' },
  generatedDataset: { type: mongoose.Schema.Types.Mixed, default: [] },
  aiResponseSummary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.SimulationRun || mongoose.model('SimulationRun', simulationRunSchema)
