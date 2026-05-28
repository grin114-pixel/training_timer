export type WorkoutPhase = {
  label: string
  duration: number // seconds
  type: 'warmup' | 'run' | 'walk' | 'cooldown'
}

export const WORKOUT_SEQUENCE: WorkoutPhase[] = [
  { label: '준비운동', duration: 5 * 60, type: 'warmup' },
  { label: '뛰기', duration: 2 * 60 + 30, type: 'run' },
  { label: '걷기', duration: 2 * 60, type: 'walk' },
  { label: '뛰기', duration: 2 * 60 + 30, type: 'run' },
  { label: '걷기', duration: 2 * 60, type: 'walk' },
  { label: '뛰기', duration: 2 * 60 + 30, type: 'run' },
  { label: '걷기', duration: 2 * 60, type: 'walk' },
  { label: '뛰기', duration: 2 * 60 + 30, type: 'run' },
  { label: '걷기', duration: 2 * 60, type: 'walk' },
  { label: '뛰기', duration: 2 * 60 + 30, type: 'run' },
  { label: '마무리운동', duration: 5 * 60, type: 'cooldown' },
]

export const TOTAL_SECONDS = WORKOUT_SEQUENCE.reduce((acc, p) => acc + p.duration, 0)

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getPhaseIndex(elapsedSeconds: number): number {
  let accumulated = 0
  for (let i = 0; i < WORKOUT_SEQUENCE.length; i++) {
    accumulated += WORKOUT_SEQUENCE[i].duration
    if (elapsedSeconds < accumulated) return i
  }
  return WORKOUT_SEQUENCE.length - 1
}

export function getPhaseRemaining(elapsedSeconds: number): number {
  let accumulated = 0
  for (const phase of WORKOUT_SEQUENCE) {
    accumulated += phase.duration
    if (elapsedSeconds < accumulated) {
      return accumulated - elapsedSeconds
    }
  }
  return 0
}

export function getPhaseEndSecond(elapsedSeconds: number): number {
  let accumulated = 0
  for (const phase of WORKOUT_SEQUENCE) {
    accumulated += phase.duration
    if (elapsedSeconds < accumulated) return accumulated
  }
  return TOTAL_SECONDS
}
