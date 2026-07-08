import { useState } from 'react'
import { useT } from '../i18n/LangContext.jsx'

const API_BASE = 'http://localhost:3001/api'

export default function AuthPage({ user, onAuth, onLogout }) {
  const t = useT()
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  if (user) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>My Profile</h1>
            <p>Your AquaMind AI account.</p>
          </div>
        </div>
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="stat-label">{t('name')}</div>
          <div className="stat-value" style={{ fontSize: 20, marginBottom: 14 }}>{user.name}</div>
          <div className="stat-label">{t('email')}</div>
          <div className="stat-value" style={{ fontSize: 16, marginBottom: 14 }}>{user.email}</div>
          <div className="stat-label">Role</div>
          <div className="stat-value" style={{ fontSize: 16, marginBottom: 20 }}>
            <span className="pill ok" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
          <button className="btn danger-outline" onClick={onLogout}>{t('logOut')}</button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      onAuth(data.token, data.user)
      setStatus('idle')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{mode === 'login' ? 'Log In' : 'Create Account'}</h1>
          <p>Sign in to save your usage history, alerts, and chat history to your account.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 12 }}>
              <label className="stat-label" style={{ display: 'block', marginBottom: 6 }}>{t('name')}</label>
              <input
                className="auth-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label className="stat-label" style={{ display: 'block', marginBottom: 6 }}>{t('email')}</label>
            <input
              className="auth-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="stat-label" style={{ display: 'block', marginBottom: 6 }}>{t('password')}</label>
            <input
              className="auth-input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {status === 'error' && (
            <p style={{ color: 'var(--rose)', fontSize: 13, marginTop: -6, marginBottom: 14 }}>{errorMsg}</p>
          )}

          <button className="btn" type="submit" style={{ width: '100%', marginBottom: 10 }} disabled={status === 'loading'}>
            {status === 'loading' ? t('loading') : mode === 'login' ? t('logIn') : t('createAccount')}
          </button>
        </form>

        <button
          className="btn ghost"
          style={{ width: '100%' }}
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? "New here? Create an account" : 'Already have an account? Log in'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
          Requires the backend server running with a MongoDB connection (see CONNECT-REAL-AI.md /
          server setup). Without it, the rest of the app still works fully using local demo data.
        </p>
      </div>
    </div>
  )
}
