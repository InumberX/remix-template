import type { StyleRecipe } from '../../../../../ui/styles/public/mixins.ts'

// Only the custom properties declared in `@layer base` of
// public/static/css/app.css exist. The hover tint is derived from one of them
// with color-mix rather than introducing a literal or a token nothing defines.
const SURFACE_HOVER = 'color-mix(in srgb, var(--color-util-black) 6%, transparent)'

export const exampleCopyButton: StyleRecipe = {
  appearance: 'none',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  padding: '16px',
  border: 0,
  borderRadius: '12px',
  color: 'var(--color-util-black)',
  background: 'transparent',
  transition: 'background-color 150ms ease, color 150ms ease',
  '&:hover, &:focus-visible': {
    background: SURFACE_HOVER,
    outline: 'none',
  },
}

/**
 * Inverted while a copy result is showing: an unmistakable state change built
 * from the two colour tokens the app actually declares.
 *
 * The `&:hover, &:focus-visible` block is repeated rather than inherited. The
 * spread that merges this over the base is SHALLOW, so a modifier that only set
 * `background` at the top level would leave the base's hover block untouched and
 * lose to it — and a mouse click always leaves the pointer on the button, so the
 * inverted state would be invisible in the one path that produces it (white text
 * on the near-white hover tint).
 */
export const exampleCopyButton__active: StyleRecipe = {
  background: 'var(--color-util-black)',
  color: 'var(--color-util-white)',
  '&:hover, &:focus-visible': {
    background: 'var(--color-util-black)',
    color: 'var(--color-util-white)',
    outline: 'none',
  },
}

export const exampleCopyButton_label: StyleRecipe = {
  alignItems: 'center',
  display: 'flex',
  fontSize: '14px',
  flex: '1 1 0',
  lineHeight: 1.5,
  minWidth: 0,
  position: 'relative',
  transition: 'opacity 180ms ease',
}

/** Held at zero opacity for the fade-out step between `copied` and `idle`. */
export const exampleCopyButton_label__fading: StyleRecipe = { opacity: 0 }

export const exampleCopyButton_status: StyleRecipe = {
  alignItems: 'center',
  display: 'flex',
  inset: 0,
  position: 'absolute',
}

/**
 * The status text and the prompt occupy the same box, so exactly one of them is
 * visible at a time. `visibility` rather than `display` keeps the box measured.
 */
export const exampleCopyButton__hidden: StyleRecipe = { visibility: 'hidden' }
export const exampleCopyButton__visible: StyleRecipe = { visibility: 'visible' }

export const exampleCopyButton_icon: StyleRecipe = {
  flex: '0 0 24px',
  width: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    width: '20px',
    height: '20px',
    display: 'block',
    transform: 'rotate(180deg)',
  },
}
