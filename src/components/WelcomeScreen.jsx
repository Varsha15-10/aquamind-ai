import { useEffect, useState } from 'react'
import { useT } from '../i18n/LangContext.jsx'

const MISSION_POINTS = [
  { icon: '💧', text: 'Every year, cities lose 30%+ of treated water to leaks nobody notices.' },
  { icon: '🤖', text: 'AquaMind AI watches your usage and catches problems automatically.' },
  { icon: '📈', text: 'It predicts tomorrow\'s usage and shows you exactly how to save more.' },
]

export default function WelcomeScreen({ onEnter }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const t = useT()

  useEffect(() => {
    if (visibleCount >= MISSION_POINTS.length) return
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 650)
    return () => clearTimeout(timer)
  }, [visibleCount])

  return (
    <div className="welcome-screen">
      <div className="welcome-ripples" aria-hidden="true">
        <div className="ripple-ring" />
        <div className="ripple-ring" />
        <div className="ripple-ring" />
      </div>

      <div className="welcome-content">
        <div className="welcome-brand">
          <span className="brand-mark welcome-mark">💧</span>
          <h1 className="welcome-title">AquaMind AI</h1>
        </div>
        <p className="welcome-tagline">{t('welcomeTagline')}</p>

        <div className="welcome-points">
          {MISSION_POINTS.map((p, i) => (
            <div
              key={p.text}
              className={`welcome-point ${i < visibleCount ? 'show' : ''}`}
            >
              <span className="welcome-point-icon">{p.icon}</span>
              <span>{p.text}</span>
            </div>
          ))}
        </div>

        <button
          className={`btn welcome-enter-btn ${visibleCount >= MISSION_POINTS.length ? 'ready' : ''}`}
          onClick={onEnter}
        >
          {t('welcomeEnter')}
        </button>
      </div>
    </div>
  )
}
