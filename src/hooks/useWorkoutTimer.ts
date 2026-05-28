import { useState, useEffect, useRef, useCallback } from 'react'
import {
  WORKOUT_SEQUENCE,
  TOTAL_SECONDS,
  getPhaseIndex,
  getPhaseRemaining,
} from '../lib/workoutSequence'
import { supabase } from '../lib/supabase'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export function useWorkoutTimer() {
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const currentPhaseIndex = getPhaseIndex(elapsed)
  const currentPhase = WORKOUT_SEQUENCE[currentPhaseIndex]
  const phaseRemaining = getPhaseRemaining(elapsed)
  const totalRemaining = TOTAL_SECONDS - elapsed
  const progress = (elapsed / TOTAL_SECONDS) * 100
  const phaseProgress =
    ((currentPhase.duration - phaseRemaining) / currentPhase.duration) * 100

  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + 1
      if (next >= TOTAL_SECONDS) {
        setStatus('finished')
        return TOTAL_SECONDS
      }
      return next
    })
  }, [])

  const ensureSession = useCallback(async () => {
    if (sessionIdRef.current) return
    startTimeRef.current = Date.now()
    try {
      const { data } = await supabase
        .from('workout_sessions')
        .insert({
          started_at: new Date().toISOString(),
          completed: false,
          total_seconds: TOTAL_SECONDS,
        })
        .select()
        .single()
      if (data) sessionIdRef.current = data.id
    } catch {
      // Supabase not configured yet — app still works offline
    }
  }, [])

  const start = useCallback(async () => {
    setElapsed(0)
    setStatus('running')
    await ensureSession()
  }, [ensureSession])

  const pause = useCallback(() => {
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    setStatus('running')
  }, [])

  const jumpToPhase = useCallback(
    async (phaseIndex: number) => {
      const idx = Math.max(0, Math.min(phaseIndex, WORKOUT_SEQUENCE.length - 1))
      const startSecond = WORKOUT_SEQUENCE.slice(0, idx).reduce((acc, p) => acc + p.duration, 0)
      setElapsed(startSecond)
      setStatus('running')
      await ensureSession()
    },
    [ensureSession],
  )

  // interval management
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status, tick])

  // on finish, save to supabase
  useEffect(() => {
    if (status === 'finished' && sessionIdRef.current) {
      supabase
        .from('workout_sessions')
        .update({ finished_at: new Date().toISOString(), completed: true })
        .eq('id', sessionIdRef.current)
        .then(() => {}, () => {})
    }
  }, [status])

  return {
    status,
    elapsed,
    totalRemaining,
    phaseRemaining,
    progress,
    phaseProgress,
    currentPhase,
    currentPhaseIndex,
    totalPhases: WORKOUT_SEQUENCE.length,
    start,
    pause,
    resume,
    jumpToPhase,
  }
}
