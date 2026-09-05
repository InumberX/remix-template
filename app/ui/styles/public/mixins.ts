// Ported from auba-general-view: app/styles/mixins/{transition,size}.css.ts
import type { css } from 'remix/ui'

import { BREAKPOINTS } from './breakpoints.ts'

export const getTransition = (
  transitions: { property: string; speed?: number; delay?: number }[]
): string => {
  return transitions
    .map(({ property, speed = 0.3, delay }) => `${speed}s${delay ? ` ${delay}s` : ''} ${property}`)
    .join(', ')
}

// The same span the breakpoint scale covers, so a fluid size and a media query
// never disagree about where the range starts and ends.
const MIN_VIEWPORT = BREAKPOINTS.xs
const MAX_VIEWPORT = BREAKPOINTS.xxl

/** Fluid size between two viewport widths, expressed in rem at a 62.5% root. */
export const getClampRem = (minSize: number, maxSize: number): string => {
  const sizeRate = maxSize - minSize
  const viewportRate = MAX_VIEWPORT - MIN_VIEWPORT
  const changingSize = Math.round((sizeRate / viewportRate) * 10000) / 100
  const fixedSize = Math.round((minSize - (sizeRate / viewportRate) * MIN_VIEWPORT) * 62.5) / 1000
  const minRemSize = Math.round(minSize * 62.5) / 1000
  const maxRemSize = Math.round(maxSize * 62.5) / 1000

  return `clamp(${minRemSize}rem, ${fixedSize}rem + ${changingSize}vi, ${maxRemSize}rem)`
}

/**
 * Truncates to `maxLine` lines with an ellipsis. `-webkit-line-clamp` is the
 * only cross-browser way to do this; the `-webkit-box` display is required.
 */
export const getLineClamp = (maxLine: number): StyleRecipe => {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    WebkitLineClamp: maxLine,
  }
}

/** Fluid size between the two viewport widths, in px. */
export const getClampPx = (minSize: number, maxSize: number): string => {
  const sizeRate = maxSize - minSize
  const viewportRate = MAX_VIEWPORT - MIN_VIEWPORT
  const changingSize = Math.round((sizeRate / viewportRate) * 10000) / 100
  const fixedSize = Math.round(minSize - (sizeRate / viewportRate) * MIN_VIEWPORT)

  return `clamp(${minSize}px, ${fixedSize}px + ${changingSize}vi, ${maxSize}px)`
}

/**
 * Style recipes are plain `CSSProps` objects, never `css(...)` descriptors, so
 * consumers can spread them into a single `css(...)` call. Two separate
 * descriptors on one element do NOT have a reliable cascade order — see the
 * "Composing styles" note in CLAUDE.md.
 */
export type StyleRecipe = Parameters<typeof css>[0]
