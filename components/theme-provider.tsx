'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { SEASONAL_THEMES } from '@/lib/seasonal-themes'

function SeasonalThemeApplier() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Cargar tema guardado del localStorage
    const savedTheme = localStorage.getItem('seasonalTheme') as keyof typeof SEASONAL_THEMES | null
    const currentTheme = savedTheme || 'default'

    applySeasonalTheme(currentTheme)

    // Escuchar evento de cambio de tema
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<keyof typeof SEASONAL_THEMES>
      applySeasonalTheme(customEvent.detail)
      localStorage.setItem('seasonalTheme', customEvent.detail)
    }

    window.addEventListener('seasonalThemeChanged', handleThemeChange)
    return () => window.removeEventListener('seasonalThemeChanged', handleThemeChange)
  }, [mounted])

  return null
}

function applySeasonalTheme(themeName: keyof typeof SEASONAL_THEMES) {
  const theme = SEASONAL_THEMES[themeName]
  if (!theme) return

  const root = document.documentElement

  // Aplicar variables CSS
  root.style.setProperty('--color-primary', theme.primaryColor)
  root.style.setProperty('--color-secondary', theme.secondaryColor)
  root.style.setProperty('--color-accent', theme.accentColor)
  root.style.setProperty('--gradient-start', theme.gradientStart)
  root.style.setProperty('--gradient-end', theme.gradientEnd)

  // Aplicar clase al documento
  document.documentElement.className = `theme-${themeName}`

  // Cambiar favicon o elementos visuales si es necesario
  // SOLUCIÓN: Intersección de tipos para indicarle a TS que 'emoji' es un string opcional
  const themeEmoji = (theme as typeof theme & { emoji?: string }).emoji || '🎨'
  
  // Asumiendo que 'name' sí existe en tu tipo, si diera error haríamos lo mismo.
  document.title = `Rich Shakes - ${theme.name} ${themeEmoji}`
}

export { applySeasonalTheme }

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SeasonalThemeApplier />
      {children}
    </NextThemesProvider>
  )
}