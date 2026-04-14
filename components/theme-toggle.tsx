'use client'

import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold tracking-widest uppercase transition-all duration-300"
      style={{
        borderColor: theme === 'neon' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(124, 58, 237, 0.4)',
        background: theme === 'neon' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(12, 12, 20, 0.8)',
        color: theme === 'neon' ? '#A855F7' : '#7C3AED',
      }}
      title={`Switch to ${theme === 'neon' ? 'Underground' : 'Neon'} mode`}
    >
      <span className="text-[10px]">{theme === 'neon' ? '◉' : '◎'}</span>
      {theme === 'neon' ? 'Neon' : 'Underground'}
    </button>
  )
}
