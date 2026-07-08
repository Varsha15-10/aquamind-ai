export default function WaveDivider() {
  return (
    <div className="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 2400 100" preserveAspectRatio="none">
        <path
          d="M0,50 C150,100 350,0 600,50 C850,100 1050,0 1200,50 C1350,100 1550,0 1800,50 C1950,100 2150,0 2400,50 L2400,100 L0,100 Z"
          fill="rgba(34, 211, 238, 0.15)"
        />
        <path
          d="M1200,50 C1350,100 1550,0 1800,50 C1950,100 2150,0 2400,50 C2550,100 2750,0 3000,50 C3150,100 3350,0 3600,50 L3600,100 L1200,100 Z"
          fill="rgba(34, 211, 238, 0.15)"
        />
      </svg>
    </div>
  )
}
