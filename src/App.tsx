import { useWorkoutTimer } from './hooks/useWorkoutTimer'
import { WORKOUT_SEQUENCE, formatTime } from './lib/workoutSequence'
import './App.css'

const PHASE_COLORS: Record<string, string> = {
  warmup: '#f59e0b',
  run: '#ef4444',
  walk: '#22c55e',
  cooldown: '#6366f1',
}

const PHASE_BG: Record<string, string> = {
  warmup: 'rgba(245,158,11,0.12)',
  run: 'rgba(239,68,68,0.12)',
  walk: 'rgba(34,197,94,0.12)',
  cooldown: 'rgba(99,102,241,0.12)',
}

const PHASE_ICONS: Record<string, string> = {
  warmup: '🤸',
  run: '🏃',
  walk: '🚶',
  cooldown: '🧘',
}

export default function App() {
  const {
    status,
    totalRemaining,
    phaseRemaining,
    progress,
    phaseProgress,
    currentPhase,
    currentPhaseIndex,
    start,
    pause,
    resume,
    jumpToPhase,
  } = useWorkoutTimer()

  const color = PHASE_COLORS[currentPhase?.type ?? 'warmup']
  const bg = PHASE_BG[currentPhase?.type ?? 'warmup']
  const icon = PHASE_ICONS[currentPhase?.type ?? 'warmup']

  const circumference = 2 * Math.PI * 120
  const phaseStrokeDashoffset = circumference - (phaseProgress / 100) * circumference

  const nextPhase =
    currentPhaseIndex < WORKOUT_SEQUENCE.length - 1
      ? WORKOUT_SEQUENCE[currentPhaseIndex + 1]
      : null

  return (
    <div className="app" style={{ '--phase-color': color, '--phase-bg': bg } as React.CSSProperties}>
      <div className="app-inner">
        {/* Header */}
        <header className="app-header">
          <div className="app-header-brand">
            <svg className="app-header-icon" viewBox="0 0 48 48" width={32} height={32} aria-hidden>
              <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 12V8M24 8H20M24 8H28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M24 24V16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 24L30 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h1 className="app-title">운동 타이머</h1>
          </div>
          {status !== 'idle' && (
            <div className="total-remaining">
              전체 {formatTime(totalRemaining)} 남음
            </div>
          )}
        </header>

        {/* Phase Sequence Bar */}
        <div className="sequence-bar">
          {WORKOUT_SEQUENCE.map((phase, i) => (
            <div
              key={i}
              className={`sequence-step ${i === currentPhaseIndex && status !== 'idle' ? 'active' : ''} ${
                status !== 'idle' && i < currentPhaseIndex ? 'done' : ''
              }`}
              style={{
                backgroundColor:
                  i === currentPhaseIndex && status !== 'idle'
                    ? PHASE_COLORS[phase.type]
                    : i < currentPhaseIndex && status !== 'idle'
                    ? `${PHASE_COLORS[phase.type]}55`
                    : undefined,
              }}
              title={`${phase.label} ${formatTime(phase.duration)}`}
            />
          ))}
        </div>

        {/* Main Timer Circle */}
        <div className="timer-block">
        <div className="timer-stack">
        <div className="timer-container">
          <div className="timer-ring-wrapper">
            <svg className="timer-svg" viewBox="0 0 280 280">
              {/* total progress ring (outer) */}
              <circle
                className="ring-track"
                cx="140" cy="140" r="130"
                fill="none"
                strokeWidth="4"
              />
              <circle
                className="ring-total"
                cx="140" cy="140" r="130"
                fill="none"
                strokeWidth="4"
                stroke={color}
                strokeOpacity="0.4"
                strokeDasharray={2 * Math.PI * 130}
                strokeDashoffset={2 * Math.PI * 130 - (progress / 100) * 2 * Math.PI * 130}
                strokeLinecap="round"
                transform="rotate(-90 140 140)"
              />

              {/* phase progress ring (inner) */}
              <circle
                className="ring-track"
                cx="140" cy="140" r="120"
                fill="none"
                strokeWidth="10"
              />
              <circle
                className="ring-phase"
                cx="140" cy="140" r="120"
                fill="none"
                strokeWidth="10"
                stroke={color}
                strokeDasharray={circumference}
                strokeDashoffset={status === 'idle' ? circumference : phaseStrokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 140 140)"
                style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
              />
            </svg>

            <div className="timer-center">
              {status === 'idle' ? (
                <div className="idle-content">
                  <span className="idle-icon">🏋️</span>
                  <span className="idle-text">시작 준비</span>
                </div>
              ) : status === 'finished' ? (
                <div className="finished-content">
                  <span className="finished-icon">🎉</span>
                  <span className="finished-text">완료!</span>
                </div>
              ) : (
                <div className="running-content">
                  <span className="phase-time">{formatTime(phaseRemaining)}</span>

                  <div className="phase-top">
                    <span className="phase-top-icon">{icon}</span>
                    <span className="phase-top-label" style={{ color }}>
                      {currentPhase.label}
                    </span>
                  </div>

                  {status === 'running' && (
                    <button type="button" className="timer-btn timer-btn-pause" onClick={pause}>
                      일시정지
                    </button>
                  )}
                  {status === 'paused' && (
                    <button type="button" className="timer-btn timer-btn-resume" onClick={resume}>
                      계속하기
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Prev/Next phase buttons */}
            {status !== 'idle' && status !== 'finished' && (
              <>
                <button
                  type="button"
                  className="nav-btn nav-btn-left"
                  onClick={() => jumpToPhase(currentPhaseIndex - 1)}
                  disabled={currentPhaseIndex <= 0}
                  aria-label="이전 운동"
                  title="이전 운동"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="nav-btn nav-btn-right"
                  onClick={() => jumpToPhase(currentPhaseIndex + 1)}
                  disabled={currentPhaseIndex >= WORKOUT_SEQUENCE.length - 1}
                  aria-label="다음 운동"
                  title="다음 운동"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
        </div>

        {status !== 'idle' && status !== 'finished' && nextPhase && (
          <div className="next-under" aria-label="다음 운동">
            <span className="next-under-label">다음</span>
            <span className="next-under-icon">{PHASE_ICONS[nextPhase.type]}</span>
            <span className="next-under-name">{nextPhase.label}</span>
            <span className="next-under-time">{formatTime(nextPhase.duration)}</span>
          </div>
        )}
        </div>

        {/* Controls */}
        <div className="controls">
          {status === 'idle' && (
            <button className="btn btn-start" onClick={start}>
              <span className="btn-icon">▶</span>
              시작
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
