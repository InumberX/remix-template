// Ported from auba-general-view: app/styles/mixins/color.css.ts
import type { StyleRecipe } from './mixins.ts'

/**
 * Wraps an `R, G, B` triple in `rgba()`. Pair it with `changeColorHexToRgb`,
 * or with a custom property that already holds a comma-separated triple:
 *
 *   getRgba(changeColorHexToRgb('#2f3a3a'), 0.6)  ->  'rgba(47, 58, 58, 0.6)'
 */
export const getRgba = (color: string, alpha: number): string => {
  return `rgba(${color}, ${alpha})`
}

/** Clips a background — usually a gradient — to the text it sits behind. */
export const getTextGradation = (color: string): StyleRecipe => {
  return {
    background: color,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
}

/** `'#2f3a3a'` or `'#abc'` (with or without `#`) -> `'47, 58, 58'`. */
export const changeColorHexToRgb = (hex: string): string => {
  const body = hex.startsWith('#') ? hex.slice(1) : hex
  const expanded =
    body.length === 3
      ? body
          .split('')
          .map((c) => c + c)
          .join('')
      : body

  return [expanded.slice(0, 2), expanded.slice(2, 4), expanded.slice(4, 6)]
    .map((value) => Number.parseInt(value, 16))
    .join(', ')
}
