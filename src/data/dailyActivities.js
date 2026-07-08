// Typical vs. efficient water use per activity (liters).
// Sources are approximate household averages used for illustration.

export const DAILY_ACTIVITIES = [
  { id: 'shower', name: 'Shower / Bathing', icon: '🚿', typical: 65, efficient: 35, unit: 'per use' },
  { id: 'brush', name: 'Brushing Teeth', icon: '🪥', typical: 6, efficient: 1, unit: 'per use (tap running vs. off)' },
  { id: 'dishes', name: 'Washing Utensils', icon: '🍽️', typical: 20, efficient: 8, unit: 'per session' },
  { id: 'laundry', name: 'Laundry Load', icon: '🧺', typical: 70, efficient: 50, unit: 'per load' },
  { id: 'toilet', name: 'Toilet Flush', icon: '🚽', typical: 15, efficient: 6, unit: 'per flush' },
  { id: 'cooking', name: 'Cooking / Rinsing Food', icon: '🍳', typical: 10, efficient: 5, unit: 'per session' },
  { id: 'car', name: 'Washing Car', icon: '🚗', typical: 150, efficient: 40, unit: 'per wash' },
  { id: 'garden', name: 'Watering Plants', icon: '🌱', typical: 30, efficient: 15, unit: 'per session' },
]
