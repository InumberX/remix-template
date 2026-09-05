import type { StyleRecipe } from '../../styles/public/mixins.ts'

/**
 * `100svb` after `100vb` so browsers without small-viewport units keep the
 * fallback — the two declarations are the array form generalview used.
 */
export const layoutWrapper: StyleRecipe = {
  display: 'flex',
  flexDirection: 'column',
  minBlockSize: '100svb',
  position: 'relative',
}
