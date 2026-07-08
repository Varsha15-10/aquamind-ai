const STORAGE_KEY = 'aquamind-leak-history'

export function loadLeakHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLeakHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export function addLeakEvent(history, event) {
  const updated = [event, ...history].slice(0, 20)
  saveLeakHistory(updated)
  return updated
}

export function resolveLatestLeak(history) {
  const updated = [...history]
  const idx = updated.findIndex((e) => e.status === 'active')
  if (idx !== -1) {
    updated[idx] = { ...updated[idx], status: 'resolved', resolvedAt: new Date().toISOString() }
  }
  saveLeakHistory(updated)
  return updated
}
