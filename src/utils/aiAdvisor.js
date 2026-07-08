// Shared AI advisor logic — used by the Chatbot, "Explain My Dashboard",
// and other AI-copy features across the app.
//
// Tries the real Claude/Gemini-powered backend first (see /server). If it's
// not running (e.g. no API key set up yet), falls back to the built-in
// rule-based advisor below so every AI feature in the demo NEVER breaks.

export async function getAdvisorReplyAsync(message) {
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    if (!res.ok) throw new Error('backend unavailable')
    const data = await res.json()
    if (data.reply) return data.reply
    throw new Error('no reply field')
  } catch {
    return getAdvisorReply(message)
  }
}

// Keyword-based advisor so every AI feature works with zero setup and zero API cost.
export function getAdvisorReply(message) {
  const m = message.toLowerCase()

  if (m.includes('garden') || m.includes('lawn') || m.includes('plant')) {
    return "Water your garden early morning or after sunset to cut evaporation loss by up to 30%. Use drip irrigation instead of sprinklers, and mulch beds to retain soil moisture — this alone can reduce garden water use by ~25%."
  }
  if (m.includes('leak') || m.includes('hidden') || m.includes('drip')) {
    return "To check for hidden leaks: turn off every tap and appliance, note your meter reading, wait 2 hours without using water, then check the meter again. Any change means a leak. Toilets are the #1 hidden-leak culprit — try the dye-tablet test in the tank."
  }
  if (m.includes('normal') || m.includes('average') || m.includes('usage')) {
    return "A typical 4-person household uses around 800–1000L per day (200–250L per person). Based on your dashboard trend, you're tracking close to that range — nice work. Cutting shower time by 2 minutes per person can save ~40L/day."
  }
  if (m.includes('shower') || m.includes('bath')) {
    return "Switching to a low-flow showerhead cuts usage from ~15L/min to ~9L/min. Combined with 2-minutes-shorter showers, a household of 4 can save over 1,200L per month."
  }
  if (m.includes('toilet') || m.includes('flush')) {
    return "Older toilets use 13-20L per flush; modern dual-flush models use as little as 3-6L. If replacing isn't an option, a displacement bag in the tank can cut usage by 1-2L per flush."
  }
  if (m.includes('score') || m.includes('credit') || m.includes('health')) {
    return "Your Water Health Score rises when your usage trends below the regional baseline, your forecast is improving, and you stay leak-free for 30 days. Fixing any flagged leak would meaningfully boost your score this month."
  }
  if (m.includes('rain') || m.includes('harvest')) {
    return "A 100 sq.m roof in a region with ~900mm annual rainfall can harvest roughly 60,000–75,000L per year with an 80% runoff efficiency. A first-flush diverter and a mesh filter keep the stored water clean enough for non-drinking household use."
  }
  if (m.includes('bill') || m.includes('cost') || m.includes('money')) {
    return "Municipal water is usually billed per 1,000 liters (kiloliter). Cutting daily usage by just 15% typically lowers your monthly bill by a similar margin, since most tariffs scale directly with volume used."
  }
  if (m.includes('emergency') || m.includes('drought') || m.includes('shortage')) {
    return "During a declared water emergency, prioritize essential use (drinking, cooking, hygiene) over non-essential use (gardening, car washing, lawn watering). Setting a strict per-person daily liter budget and tracking it daily is the single most effective drought response."
  }
  return "Good question — based on typical household patterns, small daily habits (shorter showers, fixing drips fast, full loads only for laundry/dishwasher) usually create the biggest savings. Want tips on a specific area — garden, bathroom, kitchen, leaks, or your bill?"
}
