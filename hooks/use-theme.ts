'use client'

import { useEffect, useState } from 'react'

type Theme = 'neon' | 'underground'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('neon')

  useEffect(() => {
    const stored = localStorage.getItem('djd-theme') as Theme | null
    const initial = stored ?? 'neon'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'neon' ? 'underground' : 'neon'
    setTheme(next)
    localStorage.setItem('djd-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return { theme, toggle }
}
