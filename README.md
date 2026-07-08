# 💧 AquaMind AI — MVP

A single-page React app: live water usage dashboard, AI leak/anomaly detection,
an AI Water Advisor chatbot, a satellite before/after monitor, and a community
water credit score — all running on realistic simulated data.

## ▶️ How to Run This (Step by Step)

**You need:** Node.js installed (https://nodejs.org — get the LTS version) and VS Code.

1. Unzip this folder anywhere on your computer.
2. Open the folder in VS Code: `File > Open Folder` → select `aquamind-ai`.
3. Open the terminal inside VS Code: `Terminal > New Terminal`.
4. Type this and press Enter (only needed once):
   ```
   npm install
   ```
   This downloads the project's dependencies — it may take 1-2 minutes.
5. Type this to start the app:
   ```
   npm run dev
   ```
6. Terminal will show a link like `http://localhost:5173/` — hold Ctrl (or Cmd on Mac)
   and click it, or copy-paste it into your browser.
7. You should see the AquaMind AI dashboard. 🎉

To stop the app, click into the terminal and press `Ctrl + C`.

## 🧭 What's Inside

- **Dashboard** — simulated 14-day smart-meter usage, AI anomaly/leak detector
  (statistical z-score model — click "Simulate a Leak Event" for a live demo),
  and a 7-day AI demand forecast.
- **AI Water Advisor** — a chatbot that gives real conservation tips. It works
  instantly with zero setup (rule-based), so your demo never breaks from WiFi
  or API limits. See below to upgrade it to a real LLM.
- **Satellite Monitor** — drag-to-compare reservoir shrinkage view (illustrative
  demo data — swap in real Sentinel-2/Earth Engine imagery for production).
- **Community Score** — gamified water credit score + neighborhood leaderboard.

### ✨ Added feature set

- **Water Health Score** — composite score (usage, leak risk, habits, forecast,
  community) with an AI-style explanation of what moved it, shown on the Dashboard.
- **"What If?" Simulator** — drag sliders for shower length, laundry loads, and
  garden watering; instantly see liters/money/CO₂ saved and score impact.
- **Weekly Action Plan & Missions** — a fitness-app style Mon–Sun checklist, plus
  a rotating daily mission with a "mark done" tracker.
- **Family Mode** — per-member usage breakdown and a shared weekly family goal.
- **Leak Probability Meter** — 🟢/🟡/🔴 plain-language leak risk instead of a raw
  confidence number, on the Dashboard.
- **Explain My Dashboard** — one-tap AI summary of today's numbers in plain English.
- **District Water Ranking** — Tamil Nadu city efficiency leaderboard.
- **Emergency Water Mode** — toggle a drought budget with essential/non-essential
  liter caps based on household size and severity.
- **AI Rainwater Calculator** — roof area + roof type + city → harvest potential,
  recommended tank size, and money saved per year.
- **Achievement Badges** — Leak Hunter, Eco Hero, Water Champion, Shower Saver,
  Water Recycler — unlock based on your real stats (Weekly Plan page).
- **Household Comparison** — "You vs. average similar household" card on the
  Dashboard, with percentile ranking.
- **AI Bill Predictor** — current vs. next-month vs. after-conservation-plan bill.
- **NGO / Government Portal** — a separate zone-consumption + reservoir-risk view
  for authorities, not households.
- **Voice Assistant** — mic button on the AI Water Advisor page (Web Speech API);
  ask by voice, hear the answer spoken back. Works best in Chrome.

### 🇮🇳 Pan-India + climate feature set (latest update)

- **Climate-Aware Reserve Forecast** — the Dashboard and Satellite Monitor now
  project each water body's level ~1 week ahead, adjusted for the current
  climate season's evaporation rate and expected monsoon rainfall inflow.
- **Live Hourly Data Refresh** — the Dashboard's smart-meter reading nudges
  automatically once every hour (see the "🔄 Live feed" pill, top-right of the
  Dashboard), simulating a real IoT feed instead of static demo data.
- **Dam Gate / Vault Status** — every dam/lake/tank now shows a gate status
  (🟢 Closed / 🟡 Standby / 🔴 Open — flood release) based on how full it is,
  mirroring real spillway-gate operating rules. Visible on the Satellite
  Monitor map popups and the detail card.
- **Nationwide Satellite Monitor** — expanded from Tamil Nadu-only to ~30
  dams, lakes, ponds/tanks, and river-flow points across India (Bhakra,
  Hirakud, Sardar Sarovar, Tehri, Dal Lake, Chilika, Ganga, Yamuna, and more),
  with type and state filters.
- **RWH Mandate Impact Estimator** — on the Rainwater Calculator page, pick a
  state and adoption rate to see total liters saved per year if rainwater
  harvesting were made mandatory for every household there.
- **State / District Ranking toggle** — switch between an All-India state
  leaderboard and the original Tamil Nadu city leaderboard.
- **Drought Season Daily Plan** — Emergency Mode now shows a stricter 7-day,
  day-by-day water-saving checklist automatically when "Severe emergency" is
  selected or Emergency Mode is switched on.

## 🔌 Turning On Real Claude AI for the Chatbot (Optional)

The chatbot works great out of the box with **zero setup** — it uses a
built-in rule-based advisor, so your demo never breaks from WiFi issues or
API limits. But if you want real, open-ended AI answers, follow these steps.

**This project has TWO parts that both need to run at the same time:**
- The `aquamind-ai` folder (frontend — the website you already have running)
- The `backend` folder (a small helper that talks to Claude securely)

### Step 1 — Get your API key
Get one free at https://console.anthropic.com (see chat for detailed steps).

### Step 2 — Add your key
1. Go into the `backend` folder
2. Find the file `.env.example`
3. Make a **copy** of it in the same folder, and rename the copy to exactly: `.env`
4. Open `.env` and replace `paste_your_key_here` with your real key
5. Save the file

⚠️ Never share this `.env` file or upload it to GitHub — it's already excluded
via `.gitignore`, so a normal GitHub push won't include it.

### Step 3 — Install and run the backend (in a SECOND terminal)
Keep your frontend (`npm run dev`) running in its terminal. Open a **new**
terminal in VS Code (Terminal → New Terminal), then:
```
cd backend
npm install
npm start
```
You should see: `AquaMind backend running at http://localhost:3001`

### Step 4 — Test it
Go back to your browser tab with the app, open **AI Water Advisor**, and ask
a question. It will now use real Claude AI automatically — no frontend code
changes needed. If the backend isn't running, it silently falls back to the
built-in advisor, so nothing ever breaks during a demo.

## 📱 Why It Wasn't Opening On Your Phone (and how to fix it)

`npm run dev` starts a server on **your computer only** — `localhost:5173`
means "this machine," so a phone can never reach it, even on the same WiFi,
unless you do one of these two things:

**Option A — Quick test on your own WiFi (temporary, good for a live demo):**
1. Run `npm run dev` as usual.
2. The terminal will now also print a **Network** URL, like
   `http://192.168.1.23:5173` (this project's `vite.config.js` is already
   set up with `host: true` so this works out of the box).
3. Make sure your phone is on the **same WiFi network** as your computer.
4. Type that `Network` URL into your phone's browser. It should load.
5. This link stops working the moment your computer goes to sleep or
   disconnects from WiFi — it's not a public link.

**Option B — A real public link anyone can open on any phone/network (recommended):**
Follow the Deploying steps below to get a permanent link like
`aquamind-ai.vercel.app` — this works on any phone, anywhere, anytime, and is
what you should actually demo with judges.

## 🚀 Deploying It Live (for your demo link)

1. Push this project to a new GitHub repository.
2. Go to https://vercel.com → "Add New Project" → import your repo.
3. Framework preset: **Vite**. Click Deploy.
4. You'll get a live link like `aquamind-ai.vercel.app` to show judges —
   this opens correctly on any phone, since it's a real public URL, not a
   `localhost` address.

## 🛠️ Tech Used

React 18, Vite, Recharts — deliberately minimal dependencies so `npm install`
is fast and reliable during a hackathon.

## 📈 Next Steps (Post-Hackathon Roadmap)

- Replace simulated data with real IoT smart-meter feeds
- Swap the rule-based advisor for a Claude-powered RAG chatbot
- Connect Google Earth Engine for live NDWI satellite computation
- Add a FastAPI backend + PostgreSQL/TimescaleDB for persistent multi-user data
- Add SMS alerts via Twilio for low-connectivity/farmer use cases

See the full architecture, database schema, and business plan in the
`AquaMind-AI-Hackathon-Blueprint.md` document from our planning conversation.
