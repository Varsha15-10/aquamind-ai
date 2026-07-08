// AquaMind AI — Backend Proxy Server
// This tiny server's only job is to keep your Google Gemini API key secret.
// The website (frontend) never sees the key — it just talks to this server,
// and this server talks to Gemini on its behalf.

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { connectDB, isDBConnected } from './db.js'
import { requireAuth, requireRole, signToken } from './middleware/auth.js'
import User from './models/User.js'
import UsageRecord from './models/UsageRecord.js'
import Alert from './models/Alert.js'
import ChatLog from './models/ChatLog.js'
import WeatherOverrideLog from './models/WeatherOverrideLog.js'
import ScarcityLevel from './models/ScarcityLevel.js'
import Asset from './models/Asset.js'
import TenantProfile from './models/TenantProfile.js'
import ComplianceReport from './models/ComplianceReport.js'
import ZoneMetric from './models/ZoneMetric.js'
import SimulationRun from './models/SimulationRun.js'
import EscalationLog from './models/EscalationLog.js'
import { fetchForecast, evaluateIrrigationOverride } from './utils/weather.js'
import { calculateRate, levelToMultiplier } from './utils/pricingEngine.js'
import { predictAssetRisk } from './utils/maintenancePredictor.js'
import { buildHeatmap } from './utils/geoCluster.js'
import { generateScenarioDataset, buildStressTestPrompt } from './utils/syntheticData.js'
import { buildComplianceReport } from './utils/reportGenerator.js'

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

const PORT = process.env.PORT || 3001
const API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash'

const SYSTEM_PROMPT = `You are the AI Water Advisor inside AquaMind AI, a water conservation platform.
Give short, practical, encouraging advice (3-5 sentences max) about saving water at home,
detecting leaks, gardening, or understanding water usage. Be specific with numbers/tips when possible.
Avoid generic filler — sound like a knowledgeable, friendly water conservation expert.`

app.post('/api/chat', async (req, res) => {
  const { message } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing "message" in request body.' })
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: 'No GEMINI_API_KEY found on the server. Add it to server/.env and restart the server.',
    })
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 300,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', response.status, errText)
      return res.status(502).json({ error: 'The AI service returned an error. Check server logs.' })
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "Sorry, I couldn't generate a reply just now."

    res.json({ reply })
  } catch (err) {
    console.error('Server error calling Gemini API:', err)
    res.status(500).json({ error: 'Something went wrong contacting the AI service.' })
  }
})

// ============================================================
// NEW: Authentication, database-backed, and role-based endpoints
// (added without modifying the existing /api/chat route above)
// ============================================================

function dbGuard(res) {
  if (!isDBConnected()) {
    res.status(503).json({ error: 'Database not connected. Add MONGODB_URI to server/.env and restart.' })
    return false
  }
  return true
}

// --- Auth ---
app.post('/api/auth/register', async (req, res) => {
  if (!dbGuard(res)) return
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' })
    }
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })
    const token = signToken(user)
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  if (!dbGuard(res)) return
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: (email || '').toLowerCase() })
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

    const valid = await bcrypt.compare(password || '', user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' })

    const token = signToken(user)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed.' })
  }
})

// --- Usage history ---
app.get('/api/usage', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const records = await UsageRecord.find({ userId: req.user.id }).sort({ date: -1 }).limit(100)
  res.json({ records })
})

app.post('/api/usage', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const { liters, date } = req.body
  if (typeof liters !== 'number') return res.status(400).json({ error: 'liters (number) is required.' })
  const record = await UsageRecord.create({ userId: req.user.id, liters, date: date || Date.now() })
  res.status(201).json({ record })
})

// --- Alerts ---
app.get('/api/alerts', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const alerts = await Alert.find({ userId: req.user.id }).sort({ detectedAt: -1 }).limit(50)
  res.json({ alerts })
})

app.post('/api/alerts', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const { type, message } = req.body
  if (!message) return res.status(400).json({ error: 'message is required.' })
  const alert = await Alert.create({ userId: req.user.id, type: type || 'leak', message })
  res.status(201).json({ alert })
})

app.patch('/api/alerts/:id/resolve', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status: 'resolved', resolvedAt: new Date() },
    { new: true }
  )
  if (!alert) return res.status(404).json({ error: 'Alert not found.' })
  res.json({ alert })
})

// --- Water credit score ---
app.get('/api/water-score', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const records = await UsageRecord.find({ userId: req.user.id }).sort({ date: -1 }).limit(30)
  if (records.length === 0) return res.json({ score: null, message: 'No usage history yet.' })

  const avg = records.reduce((a, r) => a + r.liters, 0) / records.length
  const baseline = 220
  const score = Math.max(35, Math.min(98, Math.round((baseline / avg) * 65)))
  res.json({ score, basedOnRecords: records.length })
})

// --- Chat history (persists chatbot conversations; does not alter /api/chat above) ---
app.get('/api/chat/history', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const logs = await ChatLog.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50)
  res.json({ logs })
})

app.post('/api/chat/history', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const { message, reply } = req.body
  if (!message || !reply) return res.status(400).json({ error: 'message and reply are required.' })
  const log = await ChatLog.create({ userId: req.user.id, message, reply })
  res.status(201).json({ log })
})

// --- Admin-only example endpoint (role-based access) ---
app.get('/api/admin/users', requireAuth, requireRole('admin'), async (req, res) => {
  if (!dbGuard(res)) return
  const users = await User.find().select('name email role createdAt')
  res.json({ users })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: Boolean(API_KEY), dbConnected: isDBConnected() })
})

// ============================================================
// NEW: Enterprise-grade features v2
// (weather override, dynamic pricing, predictive maintenance,
//  multi-tenant dashboards, automated reporting, geospatial
//  clustering, synthetic data sandbox, alert escalation)
// Appended without modifying any existing routes above.
// ============================================================

// ---------------------------------------------
// 1. Weather API Integration (irrigation/supply override)
// ---------------------------------------------
app.get('/api/weather/forecast', async (req, res) => {
  const lat = parseFloat(req.query.lat) || 13.0827
  const lon = parseFloat(req.query.lon) || 80.2707
  try {
    const forecast = await fetchForecast(lat, lon)
    res.json({ forecast })
  } catch (err) {
    console.error('Weather forecast error:', err)
    res.status(502).json({ error: 'Could not fetch weather forecast from Open-Meteo.' })
  }
})

app.get('/api/weather/irrigation-override', async (req, res) => {
  const lat = parseFloat(req.query.lat) || 13.0827
  const lon = parseFloat(req.query.lon) || 80.2707
  const region = req.query.region || 'default'
  try {
    const forecast = await fetchForecast(lat, lon)
    const decision = evaluateIrrigationOverride(forecast)

    if (isDBConnected()) {
      await WeatherOverrideLog.create({
        region, lat, lon,
        forecastSummary: `Tomorrow: ${forecast[1]?.rainChancePct ?? 'n/a'}% rain, max ${forecast[0]?.maxTempC ?? 'n/a'}°C`,
        overrideActive: decision.override,
        reason: decision.reason,
        action: decision.action,
      })
    }

    res.json({ ...decision, forecast })
  } catch (err) {
    console.error('Irrigation override error:', err)
    res.status(502).json({ error: 'Could not evaluate irrigation override.' })
  }
})

app.get('/api/weather/override-history', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const region = req.query.region || 'default'
  const logs = await WeatherOverrideLog.find({ region }).sort({ createdAt: -1 }).limit(30)
  res.json({ logs })
})

// ---------------------------------------------
// 2. Dynamic Pricing Engine
// ---------------------------------------------
app.get('/api/pricing/rate', async (req, res) => {
  const region = req.query.region || 'default'
  const userType = req.query.userType || 'residential'

  let scarcity = { level: 'normal', multiplier: 1.0 }
  if (isDBConnected()) {
    const record = await ScarcityLevel.findOne({ region })
    if (record) scarcity = record
  }

  res.json(calculateRate(userType, scarcity))
})

app.post('/api/pricing/scarcity', requireAuth, requireRole('admin'), async (req, res) => {
  if (!dbGuard(res)) return
  const { region, level } = req.body
  if (!region || !level) return res.status(400).json({ error: 'region and level are required.' })

  const multiplier = levelToMultiplier(level)
  const record = await ScarcityLevel.findOneAndUpdate(
    { region },
    { level, multiplier, updatedAt: new Date(), updatedBy: req.user.email },
    { new: true, upsert: true }
  )
  res.json({ scarcity: record })
})

app.get('/api/pricing/scarcity', async (req, res) => {
  if (!dbGuard(res)) return
  const records = await ScarcityLevel.find()
  res.json({ scarcityLevels: records })
})

// ---------------------------------------------
// 3. Predictive Maintenance Scheduler
// ---------------------------------------------
app.post('/api/maintenance/assets', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const { name, type, zone, installedAt } = req.body
  if (!name) return res.status(400).json({ error: 'name is required.' })
  const asset = await Asset.create({ name, type, zone, installedAt })
  res.status(201).json({ asset })
})

app.get('/api/maintenance/assets', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const assets = await Asset.find().sort({ riskScore: -1 })
  res.json({ assets })
})

app.post('/api/maintenance/assets/:id/readings', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const { flowRate, pressure, date } = req.body
  if (typeof flowRate !== 'number') return res.status(400).json({ error: 'flowRate (number) is required.' })

  const asset = await Asset.findById(req.params.id)
  if (!asset) return res.status(404).json({ error: 'Asset not found.' })

  asset.flowReadings.push({ flowRate, pressure, date: date || Date.now() })
  const prediction = predictAssetRisk(asset)
  asset.riskScore = prediction.riskScore
  asset.riskLevel = prediction.riskLevel
  asset.predictedFailureInDays = prediction.predictedFailureInDays
  asset.lastPredictedAt = new Date()
  await asset.save()

  res.status(201).json({ asset, prediction })
})

app.get('/api/maintenance/predictions', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const assets = await Asset.find()
  const flagged = assets
    .map((asset) => ({ asset, prediction: predictAssetRisk(asset) }))
    .filter(({ prediction }) => prediction.riskLevel === 'high' || prediction.riskLevel === 'critical')
    .sort((a, b) => b.prediction.riskScore - a.prediction.riskScore)

  res.json({ flaggedForMaintenance: flagged })
})

// ---------------------------------------------
// 4. Multi-Tenant Role Dashboard
// ---------------------------------------------
app.post('/api/tenant/role', requireAuth, requireRole('admin'), async (req, res) => {
  if (!dbGuard(res)) return
  const { userId, tenantRole, region } = req.body
  if (!userId || !tenantRole) return res.status(400).json({ error: 'userId and tenantRole are required.' })

  const profile = await TenantProfile.findOneAndUpdate(
    { userId },
    { tenantRole, region: region || 'default' },
    { new: true, upsert: true }
  )
  res.json({ profile })
})

app.get('/api/tenant/dashboard-config', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const profile = await TenantProfile.findOne({ userId: req.user.id })
  const tenantRole = profile?.tenantRole || 'consumer'

  const configs = {
    municipal_engineer: {
      widgets: ['predictive-maintenance', 'geospatial-heatmap', 'weather-override', 'usage-trends'],
      landingView: 'infrastructure',
    },
    admin_supervisor: {
      widgets: ['dynamic-pricing', 'automated-reports', 'alert-escalation', 'district-ranking'],
      landingView: 'operations',
    },
    consumer: {
      widgets: ['usage-trends', 'bill-predictor', 'leak-alerts', 'weekly-plan'],
      landingView: 'household',
    },
  }

  res.json({ tenantRole, region: profile?.region || 'default', config: configs[tenantRole] })
})

// ---------------------------------------------
// 5. Automated Report Generator
// ---------------------------------------------
app.post('/api/reports/generate', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const { reportType, periodStart, periodEnd } = req.body
  if (!['environmental_compliance', 'esg', 'daily_audit'].includes(reportType)) {
    return res.status(400).json({ error: 'reportType must be one of environmental_compliance, esg, daily_audit.' })
  }

  const dateFilter = {}
  if (periodStart) dateFilter.$gte = new Date(periodStart)
  if (periodEnd) dateFilter.$lte = new Date(periodEnd)

  const usageRecords = await UsageRecord.find({
    userId: req.user.id,
    ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
  })
  const alerts = await Alert.find({ userId: req.user.id })

  const reportData = buildComplianceReport({ reportType, usageRecords, alerts, periodStart, periodEnd })
  const saved = await ComplianceReport.create({ userId: req.user.id, ...reportData })

  res.status(201).json({ report: saved })
})

app.get('/api/reports', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const reports = await ComplianceReport.find({ userId: req.user.id }).sort({ generatedAt: -1 }).limit(50)
  res.json({ reports })
})

// ---------------------------------------------
// 6. Geospatial Clustering Map
// ---------------------------------------------
app.post('/api/geospatial/zones', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const { zoneId, name, lat, lon, wasteScore, leakProbability } = req.body
  if (!zoneId || !name || lat == null || lon == null) {
    return res.status(400).json({ error: 'zoneId, name, lat, and lon are required.' })
  }
  const zone = await ZoneMetric.findOneAndUpdate(
    { zoneId },
    { name, lat, lon, wasteScore: wasteScore || 0, leakProbability: leakProbability || 0, updatedAt: new Date() },
    { new: true, upsert: true }
  )
  res.status(201).json({ zone })
})

app.get('/api/geospatial/heatmap', async (req, res) => {
  if (!dbGuard(res)) return
  const zones = await ZoneMetric.find()
  const heatmap = buildHeatmap(zones)
  res.json({ heatmap, zoneCount: zones.length })
})

// ---------------------------------------------
// 7. Synthetic Data Generator (drought/flood sandbox)
// ---------------------------------------------
app.post('/api/simulate/scenario', requireAuth, async (req, res) => {
  const { scenarioType, intensity, durationDays, region } = req.body
  if (!['drought', 'flood'].includes(scenarioType)) {
    return res.status(400).json({ error: 'scenarioType must be "drought" or "flood".' })
  }

  const dataset = generateScenarioDataset(scenarioType, intensity, durationDays || 7)
  let aiResponseSummary = ''

  if (API_KEY) {
    try {
      const prompt = buildStressTestPrompt(scenarioType, intensity || 'moderate', dataset)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      })
      if (response.ok) {
        const data = await response.json()
        aiResponseSummary = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      }
    } catch (err) {
      console.error('Simulation AI response error:', err)
    }
  }

  let saved = null
  if (isDBConnected()) {
    saved = await SimulationRun.create({
      scenarioType, intensity: intensity || 'moderate', durationDays: durationDays || 7,
      region: region || 'default', generatedDataset: dataset, aiResponseSummary,
    })
  }

  res.status(201).json({ dataset, aiResponseSummary, run: saved })
})

app.get('/api/simulate/history', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const runs = await SimulationRun.find().sort({ createdAt: -1 }).limit(20)
  res.json({ runs })
})

// ---------------------------------------------
// 8. Alert Escalation Logic
// ---------------------------------------------
const ESCALATION_WINDOW_MINUTES = 15

// Checks for active alerts that have gone unacknowledged past the escalation
// window and dispatches (simulated) WhatsApp/SMS escalations to field technicians.
app.post('/api/escalation/run-check', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const cutoff = new Date(Date.now() - ESCALATION_WINDOW_MINUTES * 60 * 1000)

  const staleAlerts = await Alert.find({ status: 'active', detectedAt: { $lte: cutoff } })
  const created = []

  for (const alert of staleAlerts) {
    const existing = await EscalationLog.findOne({ alertId: alert._id, status: { $ne: 'acknowledged' } })
    if (existing) continue

    const log = await EscalationLog.create({
      alertId: alert._id,
      technicianName: req.body.technicianName || 'Field Technician (auto-assigned)',
      technicianContact: req.body.technicianContact || 'unassigned',
      channel: req.body.channel || 'whatsapp',
      status: 'sent', // simulated dispatch — no live Twilio/WhatsApp credentials configured
    })
    created.push(log)
  }

  res.json({
    checkedAlerts: staleAlerts.length,
    escalationsTriggered: created.length,
    escalations: created,
  })
})

app.post('/api/escalation/:id/acknowledge', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const log = await EscalationLog.findByIdAndUpdate(
    req.params.id,
    { status: 'acknowledged', acknowledgedAt: new Date() },
    { new: true }
  )
  if (!log) return res.status(404).json({ error: 'Escalation not found.' })
  res.json({ escalation: log })
})

app.get('/api/escalation/pending', requireAuth, async (req, res) => {
  if (!dbGuard(res)) return
  const logs = await EscalationLog.find({ status: { $ne: 'acknowledged' } }).sort({ triggeredAt: -1 })
  res.json({ pending: logs })
})

app.listen(PORT, () => {
  console.log(`AquaMind AI backend proxy running at http://localhost:${PORT}`)
  console.log(API_KEY ? 'Gemini API key loaded ✔' : '⚠️  No Gemini API key found in server/.env yet')
})
