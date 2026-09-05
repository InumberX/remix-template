import { css } from 'remix/ui'

// Only the custom properties declared in `@layer base` of
// public/static/css/app.css exist. The hover tint is derived from one of them
// with color-mix rather than introducing a literal or a token nothing defines.
const SURFACE_HOVER = 'color-mix(in srgb, var(--color-util-black) 6%, transparent)'

export const exampleCopyButton = css({
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
})
export const exampleCopyButton_label = css({
  alignItems: 'center',
  display: 'flex',
  fontSize: '14px',
  flex: '1 1 0',
  lineHeight: 1.5,
  minWidth: 0,
  position: 'relative',
  transition: 'opacity 180ms ease',
})
export const exampleCopyButton_status = css({
  alignItems: 'center',
  display: 'flex',
  inset: 0,
  position: 'absolute',
})
export const exampleCopyButton_icon = css({
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
})
