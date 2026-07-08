import { useEffect, useState } from 'react'

// Simulates an SMS/push notification alert appearing on screen — for demo
// purposes, since sending real SMS requires a paid Twilio account.
export default function SmsSimulator({ trigger, message }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!trigger) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [trigger])

  if (!visible) return null

  return (
    <div className="sms-toast">
      <div className="sms-toast-header">📱 SMS Alert (simulated)</div>
      <div className="sms-toast-body">{message}</div>
    </div>
  )
}
