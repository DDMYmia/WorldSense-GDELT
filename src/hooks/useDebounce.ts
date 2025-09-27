import { useEffect, useRef } from 'react'

export function useDebounce<T extends (...args: any[]) => void>(fn: T, delayMs: number) {
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])
  return (...args: Parameters<T>) => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => fn(...args), delayMs)
  }
}








