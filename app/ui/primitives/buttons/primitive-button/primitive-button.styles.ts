// Skeleton only. This tier neutralizes user-agent styling so an <a>, a <button>
// and a <span> render identically, and takes NO design decisions: no colors, no
// type scale, no motion. `color`/`font` are set to `inherit` rather than to a
// token so the styled tier above decides them.
//
// Exported as plain recipes, not css(...) descriptors, so callers can spread
// them into a single css(...) call — two descriptors on one element have no
// reliable cascade order.
import type { StyleRecipe } from '../../../styles/public/mixins.ts'

export const primitiveButton: StyleRecipe = {
  alignItems: 'center',
  background: 'transparent',
  blockSize: 'auto',
  border: 'none',
  borderRadius: 0,
  color: 'inherit',
  display: 'inline-flex',
  font: 'inherit',
  inlineSize: 'auto',
  justifyContent: 'flex-start',
  margin: 0,
  padding: 0,
  position: 'relative',
  textAlign: 'start',
  textDecoration: 'none',
}

export const primitiveButton__disabled: StyleRecipe = {
  cursor: 'not-allowed',
  pointerEvents: 'none',
}
