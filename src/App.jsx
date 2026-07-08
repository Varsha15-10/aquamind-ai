import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Chatbot from './components/Chatbot.jsx'
import SatelliteMonitor from './components/SatelliteMonitor.jsx'
import CommunityScore from './components/CommunityScore.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import WhatIfSimulator from './components/WhatIfSimulator.jsx'
import WeeklyPlan from './components/WeeklyPlan.jsx'
import FamilyMode from './components/FamilyMode.jsx'
import DistrictRanking from './components/DistrictRanking.jsx'
import RainwaterCalculator from './components/RainwaterCalculator.jsx'
import BillPredictor from './components/BillPredictor.jsx'
import EmergencyMode from './components/EmergencyMode.jsx'
import NGOPortal from './components/NGOPortal.jsx'
// --- NEW (additive) ---
import AuthPage from './components/AuthPage.jsx'
import ConsistencyCheck from './components/ConsistencyCheck.jsx'
import { LangProvider } from './i18n/LangContext.jsx'
// --- NEW: demo-safety flag — set to true later if you want Login live in a demo ---
const SHOW_LOGIN_IN_DEMO = false

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [entered, setEntered] = useState(false)

  // --- NEW (additive): theme, language, and auth state ---
  const [theme, setTheme] = useState(() => localStorage.getItem('aquamind-theme') || 'dark')
  const [lang, setLang] = useState(() => localStorage.getItem('aquamind-lang') || 'en')
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('aquamind-token'))
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem('aquamind-user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light')
    localStorage.setItem('aquamind-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('aquamind-lang', lang)
  }, [lang])

  function handleAuth(token, user) {
    setAuthToken(token)
    setAuthUser(user)
    localStorage.setItem('aquamind-token', token)
    localStorage.setItem('aquamind-user', JSON.stringify(user))
  }

  function handleLogout() {
    setAuthToken(null)
    setAuthUser(null)
    localStorage.removeItem('aquamind-token')
    localStorage.removeItem('aquamind-user')
  }

  if (!entered) {
    return (
      <LangProvider lang={lang} setLang={setLang}>
        <WelcomeScreen onEnter={() => setEntered(true)} />
      </LangProvider>
    )
  }

  return (
    <LangProvider lang={lang} setLang={setLang}>
      <div className="app-shell">
        <Sidebar
          activePage={page}
          onNavigate={setPage}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          lang={lang}
          onChangeLang={setLang}
          authUser={authUser}
          showLogin={SHOW_LOGIN_IN_DEMO}
        />
        <main className="main-area">
          {page === 'dashboard' && <Dashboard lang={lang} />}
          {page === 'advisor' && <Chatbot />}
          {page === 'satellite' && <SatelliteMonitor />}
          {page === 'community' && <CommunityScore />}
          {page === 'simulator' && <WhatIfSimulator />}
          {page === 'plan' && <WeeklyPlan />}
          {page === 'family' && <FamilyMode />}
          {page === 'ranking' && <DistrictRanking />}
          {page === 'rainwater' && <RainwaterCalculator />}
          {page === 'billing' && <BillPredictor />}
          {page === 'emergency' && <EmergencyMode />}
          {page === 'ngo' && <NGOPortal />}
          {page === 'account' && SHOW_LOGIN_IN_DEMO && <AuthPage user={authUser} onAuth={handleAuth} onLogout={handleLogout} />}
          {page === 'consistency' && <ConsistencyCheck />}
        </main>
      </div>
    </LangProvider>
  )
}
