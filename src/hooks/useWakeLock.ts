import { useEffect, useRef } from 'react'

type WakeLockSentinelLike = {
  release: () => Promise<void>
}

type WakeLockLike = {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>
}

export function useWakeLock(enabled: boolean) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    const wakeLock = (navigator as unknown as { wakeLock?: WakeLockLike }).wakeLock
    if (!wakeLock) return

    const acquire = async () => {
      if (!enabledRef.current) return
      try {
        sentinelRef.current = await wakeLock.request('screen')
      } catch {
        // Permission/unsupported environments: fail silently.
      }
    }

    const release = async () => {
      try {
        await sentinelRef.current?.release()
      } catch {
        // ignore
      } finally {
        sentinelRef.current = null
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Wake locks can be released automatically when the page is hidden.
        void acquire()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    if (enabled) {
      void acquire()
    } else {
      void release()
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void release()
    }
  }, [enabled])
}
