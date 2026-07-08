import { useState, useRef, useEffect } from 'react'
import { getAdvisorReplyAsync } from '../utils/aiAdvisor.js'
import { useT } from '../i18n/LangContext.jsx'

const SUGGESTIONS = [
  'How can I save water in my garden?',
  'How do I check for hidden leaks?',
  'Is my usage normal for a 4-person home?',
  'Tips for reducing shower water use',
]

const SpeechRecognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export default function Chatbot() {
  const t = useT()
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi, I'm your AI Water Advisor. Ask me anything about cutting your water usage, checking for leaks, or understanding your dashboard — or tap the mic and just talk to me.",
    },
  ])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [voiceSupported, setVoiceSupported] = useState(Boolean(SpeechRecognition))
  const logRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      sendMessage(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    return () => recognition.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function speak(text) {
    if (!voiceOn) return
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.02
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  function toggleListening() {
    if (!voiceSupported) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    try {
      recognitionRef.current?.start()
      setListening(true)
    } catch {
      setVoiceSupported(false)
    }
  }

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'bot', text: '', pending: true },
    ])

    const reply = await getAdvisorReplyAsync(trimmed)

    setMessages((prev) => {
      const withoutPending = prev.filter((m) => !m.pending)
      return [...withoutPending, { role: 'bot', text: reply }]
    })
    speak(reply)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('chatbotTitle')}</h1>
          <p>{t('chatbotSubtitle')}</p>
        </div>
        <button
          className={`btn ghost voice-toggle ${voiceOn ? 'on' : ''}`}
          onClick={() => setVoiceOn((v) => !v)}
          title="Toggle spoken replies"
        >
          {voiceOn ? '🔊 Voice replies on' : '🔇 Voice replies off'}
        </button>
      </div>

      <div className="card chat-panel">
        <div className="chat-log" ref={logRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.pending ? (
                <span className="typing-dots"><span></span><span></span><span></span></span>
              ) : (
                m.text
              )}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 10 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="chat-input-row">
          {voiceSupported && (
            <button
              className={`mic-btn ${listening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={listening ? 'Listening… tap to stop' : 'Tap and speak your question'}
              type="button"
            >
              {listening ? '🔴' : '🎙️'}
            </button>
          )}
          <input
            placeholder={listening ? 'Listening…' : t('chatbotPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          />
          <button className="btn" onClick={() => sendMessage(input)}>{t('send')}</button>
        </div>
        {!voiceSupported && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, marginBottom: 0 }}>
            Voice input isn't supported in this browser — try Chrome on desktop or Android for the mic feature.
          </p>
        )}
      </div>
    </div>
  )
}
