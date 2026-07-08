import { useT } from '../i18n/LangContext.jsx'

export default function LeakHistoryLog({ history }) {
  const t = useT()
  return (
    <div className="card">
      <div className="section-title">📋 {t('leakHistoryTitle')}</div>
      {history.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>No leak events recorded yet.</p>
      ) : (
        <div className="activity-list">
          {history.map((e) => (
            <div className="leak-history-row" key={e.id}>
              <span className={`pill ${e.status === 'resolved' ? 'ok' : 'danger'}`} style={{ minWidth: 78, justifyContent: 'center' }}>
                {e.status === 'resolved' ? '✔ Resolved' : '● Active'}
              </span>
              <div className="leak-history-detail">
                <div>Detected {new Date(e.detectedAt).toLocaleString()} — {e.reading}L reading, {Math.round(e.confidence * 100)}% confidence</div>
                {e.resolvedAt && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Resolved {new Date(e.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
