import { useT } from '../i18n/LangContext.jsx'

// Nav item labels reference translation keys (see src/i18n/translations.js)
const NAV_GROUPS = [
  {
    labelKey: 'monitor',
    items: [
      { id: 'dashboard', labelKey: 'dashboard', icon: '📊' },
      { id: 'satellite', labelKey: 'satelliteMonitor', icon: '🛰️' },
      { id: 'emergency', labelKey: 'emergencyMode', icon: '🚨' },
    ],
  },
  {
    labelKey: 'aiTools',
    items: [
      { id: 'advisor', labelKey: 'aiWaterAdvisor', icon: '💬' },
      { id: 'simulator', labelKey: 'whatIfSimulator', icon: '🎛️' },
      { id: 'plan', labelKey: 'weeklyPlan', icon: '✅' },
    ],
  },
  {
    labelKey: 'community',
    items: [
      { id: 'community', labelKey: 'communityScore', icon: '🏆' },
      { id: 'family', labelKey: 'familyMode', icon: '👨‍👩‍👧' },
      { id: 'ranking', labelKey: 'districtRanking', icon: '🗺️' },
    ],
  },
  {
    labelKey: 'planning',
    items: [
      { id: 'rainwater', labelKey: 'rainwaterCalculator', icon: '🌧️' },
      { id: 'billing', labelKey: 'billPredictor', icon: '🧾' },
    ],
  },
  {
    labelKey: 'admin',
    items: [
      { id: 'ngo', labelKey: 'ngoPortal', icon: '🏛️' },
      { id: 'account', labelKey: 'myProfile', icon: '👤' },
      { id: 'consistency', labelKey: 'consistencyCheck', icon: '🧪' },
    ],
  },
]

export default function Sidebar({ activePage, onNavigate, theme, onToggleTheme, lang, onChangeLang, authUser, showLogin = true }) {
  const t = useT()

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">💧</span>
        AquaMind AI
      </div>

      <div className="nav-scroll">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="nav-group">
            <div className="nav-group-label">{t(group.labelKey)}</div>
            <ul className="nav-list">
              {group.items
                .filter((item) => item.id !== 'account' || showLogin)
                .map((item) => (
                <li
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <span>{item.icon}</span>
                  {t(item.labelKey)}
                  {item.id === 'account' && authUser && (
                    <span className="pill ok" style={{ marginLeft: 'auto', fontSize: 10 }}>✔ In</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {onToggleTheme && (
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? t('lightMode') : t('darkMode')}
        </button>
      )}
      {onChangeLang && (
        <select className="lang-select" value={lang} onChange={(e) => onChangeLang(e.target.value)}>
          <option value="en">English</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>
      )}

      {/* --- NEW (additive): reset all demo data --- */}
      <button
        className="theme-toggle"
        style={{ color: 'var(--rose)', borderColor: 'rgba(251,87,121,0.3)' }}
        onClick={() => {
          if (confirm('Reset all demo data (leak history, saved settings)? This cannot be undone.')) {
            localStorage.removeItem('aquamind-leak-history')
            localStorage.removeItem('aquamind-token')
            localStorage.removeItem('aquamind-user')
            window.location.reload()
          }
        }}
      >
        🔄 Reset All Demo Data
      </button>

      <div className="sidebar-footer">
        {t('footerNote')}<br />
        {t('footerNote2')}
      </div>
    </aside>
  )
}
