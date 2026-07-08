// MongoDB connection helper using Mongoose.
// Uses MONGODB_URI from server/.env — get a free connection string from
// https://www.mongodb.com/cloud/atlas (free M0 cluster tier).

import mongoose from 'mongoose'

let connected = false

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('⚠️  No MONGODB_URI set — database features will be unavailable until you add one.')
    return false
  }
  try {
    await mongoose.connect(uri)
    connected = true
    console.log('MongoDB connected ✔')
    return true
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    return false
  }
}

export function isDBConnected() {
  return connected
}
